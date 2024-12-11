const { sql } = require("../db.js");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../model/CustomError");

exports.save = async ({ payload }) => {
  const scanBus = {
    busId: payload.bus?.id,
    createdAt: payload.bus?.createdAt,
  };
  const [savedScanBus] = await sql`
        insert into scan_bus ${sql(scanBus)} returning *`;

  const scanEmployees = payload.employees.map((item) => ({
    employeeId: item.id,
    scanBusId: savedScanBus.id,
    createdAt: item.createdAt,
  }));

  const savedScanEmployees = await sql`
        insert into scan_employee ${sql(scanEmployees)} returning *`;

  return { savedScanEmployees, savedScanBus };
};

// approach 1
// Core Dashboard Query (Non-Paginated Data)
exports.getCoreDashboardData = async ({}) => {
  // @formatter:off
  const [employeeStat] = await sql`
        SELECT COUNT(DISTINCT e.id)                                                       AS total_employees,
               COUNT(DISTINCT CASE WHEN se.created_at::DATE = CURRENT_DATE THEN e.id END) AS employees_active_today
        FROM employee e
                 LEFT JOIN scan_employee se ON e.id = se.employee_id AND se.created_at::DATE = CURRENT_DATE;`;

  const [busStat] = await sql`
        SELECT COUNT(DISTINCT b.id)                                                       AS total_buses,
               COUNT(DISTINCT CASE WHEN sb.created_at::DATE = CURRENT_DATE THEN b.id END) AS buses_active_today
        FROM bus b
                 LEFT JOIN scan_bus sb ON b.id = sb.bus_id AND sb.created_at::DATE = CURRENT_DATE;`;

  const employeeAnalytics = await sql`
    WITH hours AS (
      SELECT generate_series(
                 NOW() - INTERVAL '24 hours',
                 date_trunc('hour', NOW()) + INTERVAL '1 hour',
                 INTERVAL '1 hour'
             ) AS hour_range
    )
    SELECT
      hour_range AS hour,
        COUNT(DISTINCT CASE
            WHEN se.created_at >= hour_range
            AND se.created_at < hour_range + INTERVAL '1 hour' THEN e.id END
        ) AS active_employees_hourly,
        (SELECT COUNT(e.id)
         FROM employee e
         WHERE e.created_at <= hour_range + INTERVAL '1 hour') AS total_employees_hourly
    FROM
      hours
      LEFT JOIN scan_employee se
    ON se.created_at >= hour_range
      AND se.created_at < hour_range + INTERVAL '1 hour'
      LEFT JOIN employee e
      ON e.id = se.employee_id
    GROUP BY
      hour_range
    ORDER BY
      hour_range;
  `;

  const busAnalytics = await sql`
    WITH hours AS (
      SELECT generate_series(
                 NOW() - INTERVAL '24 hours',
                 date_trunc('hour', NOW()) + INTERVAL '1 hour',
                 INTERVAL '1 hour'
             ) AS hour_range
    )
    SELECT
      hour_range AS hour,
        COUNT(DISTINCT CASE
            WHEN sb.created_at >= hour_range
            AND sb.created_at < hour_range + INTERVAL '1 hour' THEN b.id END
        ) AS active_buses_hourly,
        (SELECT COUNT(b.id)
         FROM bus b
         WHERE b.created_at <= hour_range + INTERVAL '1 hour') AS total_buses_hourly
    FROM
      hours
      LEFT JOIN scan_bus sb
    ON sb.created_at >= hour_range
      AND sb.created_at < hour_range + INTERVAL '1 hour'
      LEFT JOIN bus b
      ON b.id = sb.bus_id
    GROUP BY
      hour_range
    ORDER BY
      hour_range;
  `;

  const employeeScanDaily = await sql`
    WITH date_series AS (
      SELECT generate_series(
                     CURRENT_DATE - INTERVAL '30 days',
                     CURRENT_DATE,
                     INTERVAL '1 day'
             )::DATE AS scan_date
    )
    SELECT
      ds.scan_date,
      COALESCE(COUNT(DISTINCT se.employee_id), 0) AS scan_count
    FROM
      date_series ds
        LEFT JOIN
      scan_employee se
      ON
      DATE(se.created_at) = ds.scan_date
    GROUP BY
      ds.scan_date
    ORDER BY
      ds.scan_date;
  `;

  // @formatter:on
  return {
    employeeStat, // totalEmployees, employeesActiveToday
    busStat, // totalBuses, busesActiveToday
    employeeAnalytics, // hour, totalEmployeesHourly, activeEmployeesHourly
    busAnalytics, //hour, totalBusesHourly, activeBusesHourly
    employeeScanDaily, //scanDate, scanCount
  };
};

// 2. Paginated Queries
// Employees List with Scan Count
//        WHERE se.created_at >= DATE ${endDateStr} - INTERVAL ${intervalStr}
exports.getEmployeeListWScanCount = async ({
  query: { endDate, interval, offset, limit, fetchTotalCount },
}) => {
  // Default values for parameters
  const endDateStr = endDate ? sql`${endDate}` : sql`CURRENT_DATE`; // Use sql only for passed values
  const intervalValue = interval || 30; // Pass interval as a number
  const offsetValue = offset || 0;
  const limitValue = limit || 10;
  fetchTotalCount = fetchTotalCount || false;

  // @formatter:off
  const result = await sql`
    SELECT e.id          AS id,
           e.employee_id AS employee_id,
           e.name        AS name,
           e.created_at  AS created_at,
           COUNT(se.id)  AS scan_count
    FROM employee e
           LEFT JOIN scan_employee se ON e.id = se.employee_id
    WHERE se.created_at::DATE >= (${endDateStr}::DATE - (${intervalValue} || ' days')::INTERVAL)
      AND se.created_at::DATE <= ${endDateStr}::DATE
    GROUP BY e.id
    ORDER BY scan_count DESC, e.id ASC LIMIT ${limitValue} OFFSET ${offsetValue}`;

  if (!fetchTotalCount) return { list: result };

  const [count] = await sql`
    SELECT COUNT(DISTINCT e.id) AS total_employee
    FROM employee e
           LEFT JOIN scan_employee se ON e.id = se.employee_id
    WHERE se.created_at::DATE >= (${endDateStr}::DATE - (${intervalValue} || ' days')::INTERVAL)
      AND se.created_at::DATE <= ${endDateStr}::DATE`;
  // @formatter:on

  return { list: result, totalCount: count.totalEmployee || 0 };
};

// Buses List with Scan Count
exports.getBusListWScanCount = async ({
  query: { endDate, interval, offset, limit, fetchTotalCount },
}) => {
  // Default values for parameters
  const endDateStr = endDate ? sql`${endDate}` : sql`CURRENT_DATE`; // Use sql only for passed values
  const intervalValue = interval || 30; // Pass interval as a number
  const offsetValue = offset || 0; // Default offset
  const limitValue = limit || 10; // Default limit
  fetchTotalCount = fetchTotalCount || false;

  // @formatter:off
  const result = await sql`
    SELECT b.id         AS id,
           b.bus_id     AS bus_id,
           b.name       AS name,
           b.created_at AS created_at,
           COUNT(sb.id) AS scan_count
    FROM bus b
           LEFT JOIN scan_bus sb ON b.id = sb.bus_id
    WHERE sb.created_at::DATE >= (${endDateStr}::DATE - (${intervalValue} || ' days')::INTERVAL)
      AND sb.created_at::DATE <= ${endDateStr}::DATE
    GROUP BY b.id
    ORDER BY scan_count DESC, b.id ASC LIMIT ${limitValue} OFFSET ${offsetValue}`;
  // @formatter:on

  if (!fetchTotalCount) return { list: result };

  const [count] = await sql`
        SELECT COUNT(DISTINCT b.id) AS total_bus
        FROM bus b
                 LEFT JOIN scan_bus sb ON b.id = sb.bus_id
        WHERE sb.created_at::DATE >= (${endDateStr}:: DATE - (${intervalValue} || ' days'):: INTERVAL)
          AND sb.created_at:: DATE <= ${endDateStr}:: DATE`;
  // @formatter:on

  return { list: result, totalCount: count.totalBus || 0 };
};

// approach 2
// Buses Active Today
exports.search = async ({}) => {
  const result = await sql`
        SELECT COUNT(DISTINCT sb.bus_id) AS buses_active_today
        FROM scan_bus sb
        WHERE
            DATE (sb.created_at) = CURRENT_DATE;
    `;
  return result;
};

// Employees Active Today
exports.search = async ({}) => {
  const result = await sql`
        SELECT COUNT(DISTINCT se.employee_id) AS employees_active_today
        FROM scan_employee se
        WHERE
            DATE (se.created_at) = CURRENT_DATE;
    `;
  return result;
};

// Employees List with Scan Count for Last x Days
exports.search = async ({ days, offset }) => {
  const result = await sql`
        WITH employees_scan_count AS
                 (SELECT e.name       AS employee_name,
                         e.id         AS employee_id,
                         COUNT(se.id) AS scan_count
                  FROM employee e
                           LEFT JOIN
                       scan_employee se ON e.id = se.employee_id
                  WHERE se.created_at >= CURRENT_DATE - INTERVAL '30 days' -- Or a dynamic date range
        GROUP BY
            e.id
            )
        SELECT *
        FROM employees_scan_count
        ORDER BY scan_count DESC LIMIT 10
        OFFSET :offset;
    `;
  return result;
};

// Buses List with Scan Count for Last x Days
exports.search = async ({ days, offset }) => {
  const result = await sql`
        WITH buses_scan_count AS
                 (SELECT b.name       AS bus_name,
                         b.id         AS bus_id,
                         COUNT(sb.id) AS scan_count
                  FROM bus b
                           LEFT JOIN
                       scan_bus sb ON b.id = sb.bus_id
                  WHERE sb.created_at >= CURRENT_DATE - INTERVAL '30 days' -- Or a dynamic date range
        GROUP BY
            b.id
            )
        SELECT *
        FROM buses_scan_count
        ORDER BY scan_count DESC LIMIT 10
        OFFSET :offset;
    `;
  return result;
};

// Analytics of Employees (Hourly Grouping)
exports.search = async ({}) => {
  const result = await sql`
        SELECT DATE_PART('hour', se.created_at) AS hour,
    COUNT(DISTINCT se.employee_id) AS employees_active_today,
    (SELECT COUNT(*) FROM employee) AS total_employees
        FROM
            scan_employee se
        WHERE
            DATE (se.created_at) = CURRENT_DATE
        GROUP BY
            DATE_PART('hour', se.created_at)
        ORDER BY
            hour;
    `;
  return result;
};

// Analytics of Buses (Hourly Grouping)
exports.search = async ({}) => {
  const result = await sql`
        SELECT DATE_PART('hour', sb.created_at) AS hour,
    COUNT(DISTINCT sb.bus_id) AS buses_active_today,
    (SELECT COUNT(*) FROM bus) AS total_buses
        FROM
            scan_bus sb
        WHERE
            DATE (sb.created_at) = CURRENT_DATE
        GROUP BY
            DATE_PART('hour', sb.created_at)
        ORDER BY
            hour;
    `;
  return result;
};

// Employees Scanned Daily Count in Last 30 Days
exports.search = async ({}) => {
  const result = await sql`
        SELECT
            DATE (se.created_at) AS scan_date, COUNT (DISTINCT se.employee_id) AS daily_employee_scans
        FROM
            scan_employee se
        WHERE
            se.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY
            DATE (se.created_at)
        ORDER BY
            scan_date;
    `;
  return result;
};
