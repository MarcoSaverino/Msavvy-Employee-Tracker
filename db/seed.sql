INSERT INTO department (department_name)
VALUES ("Sales"), ("Engineering"), ("Finance"),("Legal");

INSERT INTO role(title, salary, department_id)
VALUES 
("Sales Lead",100000.00, 1),
("Salesperson", 80000.00, 1),
("Lead Engineer", 150000.00, 2),
("Software Engineer", 120000.00, 2),
("Account Manager", 160000.00, 3),
("Accountant", 125000.00, 3),
("Legal Team Lead", 250000.00, 4),
("Lawyer", 190000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Tony","Stark", 1, null),
("Steve", "Rogers", 2, 1),
("Bruce", "Banner", 3, null),
("Thor", "Odin", 4, 2),
("Natasha", "Romanov", 5, null),
("Peter", "Parker", 6, 3),
("Stephen", "Strange", 7, null),
("Sam", "Wilson", 8, 4);