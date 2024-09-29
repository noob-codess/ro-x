import Knex from 'knex';

export const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: './out/database.sqlite'
  },
  useNullAsDefault: true
});

export async function setupDatabase(): Promise<void> {
  if (!await knex.schema.hasTable('organizations')) {
    await knex.schema.createTable('organizations', table => {
      table.increments('id').primary();
      table.integer('organization_id').notNullable();
      table.string('name').notNullable();
      table.string('website').nullable();
      table.string('country').notNullable();
      table.text('description').nullable();
      table.date('founded').nullable();
      table.string('industry').nullable();
      table.integer('number_of_employees').nullable();
      table.integer('index').notNullable();  

    });
  }

  if (!await knex.schema.hasTable('customers')) {
    await knex.schema.createTable('customers', table => {
      table.increments('id').primary();
      table.integer('customer_id').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('company').nullable();
      table.string('city').nullable();
      table.string('country').notNullable();
      table.string('phone_1').nullable();
      table.string('phone_2').nullable();
      table.string('email').nullable();
      table.date('subscription_date').nullable();
      table.string('website').nullable();
      table.integer('index').notNullable();  

    });
  }
}
