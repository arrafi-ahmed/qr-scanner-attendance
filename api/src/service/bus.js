const { sql } = require("../db.js");
const { v4: uuidv4 } = require("uuid");
const CustomError = require("../model/CustomError");

exports.save = async ({ payload }) => {
  const newBus = {
    ...payload,
    status: 1,
    uuid: uuidv4(),
    createdAt: new Date(),
  };
  const [savedBus] = await sql`
        insert into bus ${sql(newBus)} on conflict(id)
        do
        update set ${sql(newBus)} returning *`;
  return savedBus;
};

exports.search = async ({ query }) => {
  const buses = await sql`
        select *
        from bus
        where bus_id ilike concat('%', ${query}::text
            , '%');
    `;
  return buses;
};

exports.verifyQrcode = async ({ payload: { qrCodeData } }) => {
  const { id, uuid } = JSON.parse(qrCodeData);
  const bus = await sql`
        select *
        from bus
        where id = ${id}
          and uuid = ${uuid}`;
  `
    `;
  if (!bus.length) {
    throw new CustomError("Invalid QR Code!", 400);
  }
  return bus[0];
};
// approach 2
// Total Count of Buses
exports.search = async ({}) => {
  const result = await sql`
        SELECT COUNT(*) AS total_buses
        FROM bus;
    `;
  return result;
};
