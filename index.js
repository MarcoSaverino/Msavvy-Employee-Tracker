//Dependencies
const inquirer = require("inquirer"); 
const connection = require("./config/connection");
const figlet = require("figlet"); 
const chalk = require("chalk");
const validate = require("./validate"); 

require("console.table"); 

//Establishes a connection to MySQL database
connection.connect((error) => {
  if (error) throw error;
  console.log(
    chalk.rgb(255, 105, 180).bold(
      figlet.textSync("Employee\nManager", {
        font: "Standard",
        lineHeight: 3,
      })
    )
  );


  user_Choices();
});

// Prompts the user to choose an option from the list of choices
const user_Choices = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",

          "Update Employee Manager",
          "View Employees By Department",
          "Remove Department",
          "Remove Role",
          "Remove Employee",
          "View Department Budget",
          "Close",
        ],
      },
    ])

    .then((answers) => {
      const { choices } = answers;

      switch (choices) {
        case "View All Employees":
          view_AllEmployees();
          break;
        case "Add Employee":
          add_Employee();
          break;
        case "Update Employee Role":
          update_EmployeeRole();
          break;
        case "View All Roles":
          view_AllRoles();
          break;
        case "Add Role":
          add_Role();
          break;
        case "View All Departments":
          view_AllDepartments();
          break;
        case "Add Department":
          add_Department();
          break;
        case "Update Employee Manager":
          update_EmployeeManager();
          break;
        case "View Employees By Department":
          view_EmployeesByDepartment();
          break;
        case "Remove Department":
          remove_Department();
          break;
        case "Remove Role":
          remove_Role();
          break;
        case "Remove Employee":
          remove_Employee();
          break;
        case "View Department Budget":
          view_DepartmentBudget();
          break;
        case "Close":
          connection.end();
          break;
        default:
          console.log("Invalid choice");
      }
    });
};


//  View All Employees option
const view_AllEmployees = async () => {
  try {
    const [rows] = await connection.promise().query(
      `SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        JOIN role r ON r.id = e.role_id
        JOIN department d ON d.id = r.department_id
        LEFT JOIN employee m ON m.id = e.manager_id
        ORDER BY e.id;
        `
    );
    console.log("");
    console.log(chalk.rgb(255, 105, 180).bold(`View all Employees`));
    console.log("");
    console.table(rows);
    user_Choices();
  } catch (error) {
    console.error(error);
  }
};

//Add Employee Option
const add_Employee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
        validate: (firstName) => {
          if (firstName) {
            return true;
          } else {
            console.log("Please enter first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (lastName) => {
          if (lastName) {
            return true;
          } else {
            console.log("Please enter last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const newEmployee = [answer.firstName, answer.lastName];
      //Prompt  to select role for new employee
      const roleNewEmployee = `Select role.id, role.title
         FROM role
        `;
      connection
        .promise()
        .query(roleNewEmployee)
        .then(([rows, fields]) => {
          const roles = rows.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "Select the employee's role:",
                choices: roles,
              },
            ])
            .then((answer) => {
              const role = answer.role;
              newEmployee.push(role);
              //Prompt  to select manager for new employee
              const managerNewEmployee = `SELECT *
               FROM employee`;
              connection
                .promise()
                .query(managerNewEmployee)
                .then(([rows, fields]) => {
                  const managers = rows.map(
                    ({ id, first_name, last_name }) => ({
                      name: first_name + " " + last_name,
                      value: id,
                    })
                  );
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: managers,
                      },
                    ])
                    .then((answer) => {
                      const manager = answer.manager;
                      newEmployee.push(manager);

                      const insertSql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;
                     
                      connection
                        .promise()
                        .query(insertSql, newEmployee)
                        .then(([rows, fields]) => {
                          console.log(``);
                          console.log(
                            "A new employee has been added to the database"
                          );
                          console.log(``);
                         
                          view_AllEmployees();
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    });
                });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
};

// Update Employee Role Option
const update_EmployeeRole = () => {
  // Define SQL query to retrieve employee and role information
  let query = `
    SELECT e.id, e.first_name, e.last_name, r.id AS role_id, r.title 
    FROM employee e 
    INNER JOIN role r ON e.role_id = r.id 
    INNER JOIN department d ON r.department_id = d.id 
    GROUP BY e.id, r.id;
  `;

  
  connection
    .promise()
    .query(query)
    .then((response) => {
      
      const results = response[0];

      
      let arrayOfEmployees = [];
      let arrayOfRoles = [];

      
      results.forEach((employee) => {
        arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
        arrayOfRoles.push({ id: employee.role_id, title: employee.title });
      });

      
      let rolesQuery = `
        SELECT DISTINCT title 
        FROM role
      `;

      
      return connection
        .promise()
        .query(rolesQuery)
        .then((response) => {
          
          const roleTitles = response[0].map((row) => row.title);

          
          return inquirer
            .prompt([
              {
                name: "updateEmployee",
                type: "list",
                message: "Select employee to update role",
                choices: arrayOfEmployees,
              },
              {
                name: "updateRole",
                type: "list",
                message: "Select new role",
                choices: roleTitles,
              },
            ])
            .then((answer) => {
              
              let employeeId, newRoleId;

              results.forEach((employee) => {
                if (
                  answer.updateEmployee ===
                  `${employee.first_name} ${employee.last_name}`
                ) {
                  employeeId = employee.id;
                }
              });

              arrayOfRoles.forEach((role) => {
                if (answer.updateRole === role.title) {
                  newRoleId = role.id;
                }
              });

              // Update the employee role in the database
              let query = `
              UPDATE employee 
              SET role_id = ?
              WHERE id = ?
            `;

              return connection.promise().query(query, [newRoleId, employeeId]);
            })
            .then(() => {
              console.log(``);
              console.log(chalk.rgb(255, 105, 180)("Employee role updated!"));
              console.log(``);
              user_Choices();
            })
            .catch((error) => {
              console.error(error);
            });
        });
    });
};

// View All Roles Option
const view_AllRoles = () => {
  console.log(``);
  console.log(chalk.rgb(255, 105, 180)("Current Roles:"));
  console.log(``);
  const query = `SELECT r.id, r.title, d.department_name AS department
    FROM role r
    INNER JOIN department d ON r.department_id = d.id`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      
      const results = response[0];

      results.forEach((role) => {
        console.log(role.title);
      });
      console.log("");
      user_Choices();
    })
    .catch((error) => {
      console.log(error);
    });
};

//  Add Role Option
const add_Role = async () => {
  
  const query = `SELECT * 
   FROM department`;
  try {
    const response = await connection.promise().query(query);
    const arrayOfDepartments = response[0].map(
      (department) => department.department_name
    );
    arrayOfDepartments.push("Create Department");
    const answer = await inquirer.prompt([
      {
        name: "departmentName",
        type: "list",
        message: "Which department is this new role in?",
        choices: arrayOfDepartments,
      },
    ]);
    let departmentName;
    if (answer.departmentName === "Create Department") {
      departmentName = await add_Department();
    } else {
      departmentName = answer.departmentName;
    }
    const newRoleQuestions = [
      {
        name: "newRole",
        type: "input",
        message: "What is the name of your new role?",
        validate: validate.validateString,
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of this new role?",
        validate: validate.validateSalary,
      },
    ];
    const roleAnswers = await inquirer.prompt(newRoleQuestions);
    const departmentIdSql = `SELECT * FROM department
       WHERE department_name = ?`;
    const departmentIdResponse = await connection
      .promise()
      .query(departmentIdSql, departmentName);
    const departmentId = departmentIdResponse[0][0].id;
    const insertRoleSql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
    await connection
      .promise()
      .query(insertRoleSql, [
        roleAnswers.newRole,
        roleAnswers.salary,
        departmentId,
      ]);
    console.log(``);
    console.log(chalk.rgb(255, 105, 180)(`Role successfully created!`));
    view_AllRoles();
  } catch (error) {
    console.log(chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`));
    user_Choices();
  }
};

// View All Departments Option
const view_AllDepartments = () => {
  const query = `SELECT d.id AS id, d.department_name AS department
     FROM department d`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      console.log(``);
      console.log(chalk.rgb(255, 105, 180)`All Departments:`);
      console.log(``);
      console.table(response[0]); 
      user_Choices();
    });
};

// Add Department Option
const add_Department = async () => {
  try {
    const answer = await inquirer.prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the Department's name?",
        validate: validate.validateString,
      },
    ]);
    const query = `INSERT INTO department (department_name)
       VALUES (?)`;
    await connection.promise().query(query, answer.newDepartment);
    console.log(``);
    console.log(chalk.rgb(255, 105, 180)(`Department added!`));
    console.log(``);
    console.log(chalk.rgb(255, 105, 180).bold(answer.newDepartment));
    viewAllDepartments();
    return answer.newDepartment;
  } catch (error) {
    console.log(chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`));
    user_Choices();
  }
};

// Update Employee Manager Option
const update_EmployeeManager = () => {
  let query = `SELECT e.id, e.first_name, e.last_name, e.manager_id
     FROM employee e`;
  connection
    .promise()
    .query(query)
    .then((response) => {
      let arrayOfEmployees = [];
      for (const employee of response[0]) {
        arrayOfEmployees.push(`${employee.first_name} ${employee.last_name}`);
      }

      inquirer
        .prompt([
          {
            name: "selectEmployee",
            type: "list",
            message: " Select employee to update their manager:",
            choices: arrayOfEmployees,
          },
          {
            name: "newManager",
            type: "list",
            message: "Select manager:",
            choices: arrayOfEmployees,
          },
        ])
        .then((answer) => {
          let employeeId, managerId;
          response.forEach((employee) => {
            if (
              answer.selectEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
            if (
              answer.newManager ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              managerId = employee.id;
            }
          });
          if (validate.isSame(answer.selectEmployee, answer.newManager)) {
            console.log(``);
            console.log(chalk.rgb(255, 105, 180)(`Invalid Manager Selection`));
            console.log(``);
            user_Choices();
          } else {
            let query = `UPDATE employee 
             SET employee.manager_id = ?
             WHERE employee.id = ?`;

            connection
              .promise()
              .query(query, [managerId, employeeId])
              .then(() => {
                console.log(``);
                console.log(
                  chalk.rgb(255, 105, 180)(`Employee Manager updated!`)
                );
                console.log(``);
                user_Choices();
              })
              .catch((error) => {
                throw error;
              });
          }
        });
    })
    .catch((error) => {
      throw error;
    });
};

// View Employees By Department Option
const view_EmployeesByDepartment = () => {
  const query = `SELECT e.first_name, e.last_name, department.department_name AS deparment
     FROM employee e
     LEFT JOIN role ON e.role_id = role.id
     LEFT JOIN department ON role.department_id = department.id`;

  connection.query(query, (error, response) => {
    if (error) throw error;
    console.log(``);
    console.log(chalk.rgb(255, 105, 180)(`Employees by Department:`));
    console.log(``);
    console.table(response);
    user_Choices();
  });
};

// Remove Department Option
const remove_Department = () => {
  const query = `SELECT d.id, d.department_name
     FROM department d`;

  connection
    .promise()
    .query(query)
    .then((response) => {
      const arrayOfDepartments = response[0].map(
        (department) => department.department_name
      );

      return inquirer.prompt([
        {
          name: "departmentName",
          type: "list",
          message: "Select Department to be removed:",
          choices: arrayOfDepartments,
        },
      ]);
    })
    .then((answer) => {
      const departmentName = answer.departmentName;

      const departmentIdSql = `SELECT * FROM department WHERE department_name = ?`;
      return connection.promise().query(departmentIdSql, departmentName);
    })
    .then((response) => {
      const departmentId = response[0][0].id;

      const deleteDepartmentSql = `DELETE FROM department WHERE id = ?`;
      return connection.promise().query(deleteDepartmentSql, departmentId);
    })
    .then(() => {
      console.log(``);
      console.log(chalk.rgb(255, 105, 180)(`Department removed!`));
      return viewAllDepartments();
    })
    .catch((error) => {
      console.log(chalk.whiteBright.bgRed.bold(`An error occurred: ${error}`));
      return user_Choices();
    });
};

//Remove Role Option
const remove_Role = async () => {
  try {
    const [rows, fields] = await connection
      .promise()
      .query(`SELECT r.id, r.title FROM role r`);
    const arrayOfRoles = rows.map((row) => row.title);

    const answer = await inquirer.prompt([
      {
        name: "roleTitle",
        type: "list",
        message: "Select Role to be removed:",
        choices: arrayOfRoles,
      },
    ]);

    const role = rows.find((row) => row.title === answer.roleTitle);
    const [result] = await connection
      .promise()
      .query(`DELETE FROM role WHERE id = ?`, [role.id]);
    console.log(``);
    console.log(chalk.rgb(255, 105, 180)("Role removed!"));
    view_AllRoles();
  } catch (error) {
    console.error(error);
  }
};

// Remove Employee Option
const remove_Employee = async () => {
  try {
    const [rows] = await connection
      .promise()
      .query(`SELECT e.id, e.first_name, e.last_name FROM employee e`);

    const arrayOfEmployees = rows.map(
      (employee) => `${employee.first_name} ${employee.last_name}`
    );

    const answer = await inquirer.prompt([
      {
        name: "selectEmployee",
        type: "list",
        message: "Select employee to remove:",
        choices: arrayOfEmployees,
      },
    ]);

    const selectedEmployee = rows.find(
      (employee) =>
        `${employee.first_name} ${employee.last_name}` === answer.selectEmployee
    );

    await connection
      .promise()
      .query(`DELETE FROM employee WHERE id = ?`, [selectedEmployee.id]);
    console.log(``);
    console.log(chalk.rgb(255, 105, 180)(`Employee Removed!`));
    view_AllEmployees();
  } catch (error) {
    console.error(error);
  }
};

//  View Department Budget Option
const view_DepartmentBudget = () => {
  console.log(``);
  console.log(chalk.rgb(255, 105, 180)(`Budget by Department:`));
  console.log(``);
  const query = `SELECT department_id AS id, department.department_name AS department,
  SUM (salary) AS budget
  FROM role
  INNER JOIN department ON role.department_id = department.id
  GROUP BY role.department_id`;

  connection.query(query, (error, response) => {
    if (error) throw error;
    console.table(response);
    user_Choices();
  });
};
