const { sql } = require("../db.js");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../model/CustomError");

exports.save = async ({ payload }) => {
  const newEmployee = {
    ...payload,
    status: 1,
    uuid: uuidv4(),
    createdAt: new Date(),
  };
  const [savedEmployee] = await sql`
        insert into employee ${sql(newEmployee)} on conflict(id)
        do
        update set ${sql(newEmployee)} returning *`;
  return savedEmployee;
};

exports.search = async ({ query }) => {
  const employees = await sql`
        select *
        from employee
        where employee_id ilike concat('%', ${query}::text
            , '%');
    `;
  return employees;
};

exports.verifyQrcode = async ({ payload: { qrCodeData } }) => {
  const { id, uuid } = JSON.parse(qrCodeData);
  const employee = await sql`
        select *
        from employee
        where id = ${id}
          and uuid = ${uuid}`;
  `
    `;
  if (!employee.length) {
    throw new CustomError("Invalid QR Code!", 400);
  }
  return employee[0];
};
// approach 2
// Total Count of Employees
exports.search = async ({}) => {
  const result = await sql`
        SELECT COUNT(*) AS total_employees
        FROM employee;
    `;
  return result;
};
