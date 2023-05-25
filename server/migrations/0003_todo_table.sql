create table ToDoItem (
    id varchar,
    title varchar not null,
    complete boolean not null,
    description varchar,
    primary key(id)
);

create table AssignedToDate (
    to_do_item varchar references ToDoItem(id),
    date date,
    primary key(to_do_item, date)
);
