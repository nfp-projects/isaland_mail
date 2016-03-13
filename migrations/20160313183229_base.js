/* eslint-disable */
'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('aliases', function(table) {
      table.text('alias')
      table.text('email')
    }),
    knex.schema.createTable('domains', function(table) {
      table.text('domain')
        .primary()
      table.timestamp('created')
        .notNullable()
        .defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('transport', function(table) {
      table.text('domain')
        .notNullable()
        .references('domains.domain')
      table.text('transport')
        .notNullable()
        .defaultTo('')
    }),
    knex.schema.createTable('users', function(table) {
      table.increments()
      table.text('email')
      table.text('password')
      table.timestamp('created')
        .notNullable()
        .defaultTo(knex.fn.now());
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('transport'),
    knex.schema.dropTable('aliases'),
    knex.schema.dropTable('domains'),
    knex.schema.dropTable('users'),
  ]);
};
