create table to_do_item (
    id varchar,
    title varchar not null,
    complete boolean not null,
    description varchar,
    primary key(id)
);

create table assigned_to_date (
    to_do_item varchar,
    date date,
    primary key(to_do_item, date)
);
