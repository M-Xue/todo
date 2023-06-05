drop table AssignedToDate;

drop table ToDoItem;

create table ToDoItem (
    id uuid default gen_random_uuid(),
    title varchar not null,
    complete boolean default false not null,
    description varchar,
    primary key(id)
);

create table AssignedToDate (
    to_do_item uuid references ToDoItem(id),
    date date,
    rank varchar,
    primary key(to_do_item, date)
);
