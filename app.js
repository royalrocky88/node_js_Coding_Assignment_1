//--------------------Database Initialization----------------------------
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;
const initializeDBAnnServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAnnServer();

//--------------------Create Object--------------------------------------
const convertDBTodoObj = (DBObject) => {
  return {
    id: DBObject.id,
    todo: DBObject.todo,
    priority: DBObject.priority,
    status: DBObject.status,
    category: DBObject.category,
    dueDate: DBObject.due_date,
  };
};

//----------------Invalid scenarios for all APIs------------------------
const statusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const categoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const priorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const searchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const statusAndCategory = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};

const categoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const priorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

//------------------------------API 1 -----------------------------------
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    //-----Scenario 1-----list of all todos whose status is 'TO DO'------
    case statusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQuery = `
            SELECT * FROM todo
            WHERE status = '${status}';
            `;

        data = await db.all(getTodoQuery);

        response.send(data.map((eachData) => convertDBTodoObj(eachData)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    //-----Scenario 2----list of all todos whose priority is 'HIGH'-------
    case priorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `
            SELECT * FROM todo 
            WHERE priority = '${priority}';
            `;

        data = await db.all(getTodoQuery);

        response.send(data.map((eachData) => convertDBTodoObj(eachData)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    //------Scenario 3-----list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'---------------------------------------------
    case priorityAndStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `
                  SELECT * FROM todo
                  WHERE status = '${status}'
                  AND priority = '${priority}';
                  `;

          data = await db.all(getTodoQuery);

          response.send(data.map((eachData) => convertDBTodoObj(eachData)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    //------------Scenario 4----list of all todos whose todo contains 'Buy'-----
    case searchProperty(request.query):
      getTodoQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';
        `;

      data = await db.all(getTodoQuery);

      response.send(data.map((eachData) => convertDBTodoObj(eachData)));

      break;

    //-----Scenario 5----list of all todos whose category is 'WORK' and status is 'DONE'------------------------------------------------------
    case statusAndCategory(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          getTodoQuery = `
                SELECT * FROM todo
                WHERE category = '${category}'
                AND status = '${status}';
                `;

          data = await db.all(getTodoQuery);

          response.send(data.map((eachData) => convertDBTodoObj(eachData)));
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    //------Scenario 6----list of all todos whose category is 'HOME'---------
    case categoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQuery = `
            SELECT * FROM todo
            WHERE category = '${category}';
            `;

        data = await db.all(getTodoQuery);

        response.send(data.map((eachData) => convertDBTodoObj(eachData)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //------Scenario 7----list of all todos whose category is 'LEARNING' and priority is 'HIGH'------------------------------------------------
    case categoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQuery = `
                SELECT * FROM todo
                WHERE priority = '${priority}'
                AND category = '${category}';
                `;

          data = await db.all(getTodoQuery);

          response.send(date.map((eachData) => convertDBTodoObj(eachData)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //-----------Default------------------------------------------------

    default:
      getTodoQuery = `
        SELECT * FROM todo;
        `;

      data = await db.all(getTodoQuery);

      response.send(data.map((eachData) => convertDBTodoObj(eachData)));
  }
});

//------------------------------API 2 -----------------------------------
//---------specific todo based on the todo ID-------------------------------
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoIdData = `
    SELECT * FROM todo
    WHERE id = '${todoId}';
    `;

  const todoIdResult = await db.get(getTodoIdData);

  response.send(convertDBTodoObj(todoIdResult));

  console.log(todoIdResult);
});

//------------------------------API 3 -----------------------------------
//-----list of all todos with a specific due date in the query parameter
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  console.log(isMatch(date, "yyyy-MM-dd"));

  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);

    const requestDateQuery = `
    SELECT * FROM todo
    WHERE due_date = '${newDate}';
    `;

    // due_date LIKE '%2021-04-02%' because given date not available

    console.log(requestDateQuery);
    const data = await db.all(requestDateQuery);

    response.send(data.map((eachData) => convertDBTodoObj(eachData)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//------------------------------API 4 -----------------------------------
//------Create a todo in the todo table-----------------------------
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");

          const postNewDate = `
                    INSERT INTO todo(id,todo,priority,status,category,due_date)
                    VALUES (${id},'${todo}','${priority}','${status}','${category}','${newDueDate}');
                    `;

          await db.run(postNewDate);

          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//------------------------------API 5 -----------------------------------
//----Updates the details of a specific todo based on the todo ID--------
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const requestBody = request.body;
  console.log(requestBody);

  const updateByTodoId = `
  SELECT * FROM todo
  WHERE id = '${todoId}';
  `;

  const oldTodo = await db.get(updateByTodoId);

  const {
    todo = oldTodo.todo,
    priority = oldTodo.priority,
    status = oldTodo.status,
    category = oldTodo.category,
    dueDate = oldTodo.due_date,
  } = request.body;

  let updateNewTodo;

  switch (true) {
    //----Scenario 1----Status Updated-----------------------------------
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const updateNewTodo = `
            UPDATE todo SET
            status = '${status}'
            WHERE id = '${todoId}';
            `;

        await db.run(updateNewTodo);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    //----Scenario 2----Priority Updated---------------------------------

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const updateNewTodo = `
            UPDATE todo SET
            priority = '${priority}'
            WHERE id = '${todoId}';
            `;

        await db.run(updateNewTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    //----Scenario 3----Todo Update-------------------------------------
    case requestBody.todo !== undefined:
      const updateNewTodo = `
        UPDATE todo SET
        todo = '${todo}'
        WHERE id = '${todoId}';
        `;

      await db.run(updateNewTodo);

      response.send(`Todo Updated`);

      break;

    //----Scenario 3----Category Updated-------------------------------
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const updateNewTodo = `
            UPDATE todo SET
            category = '${category}'
            WHERE id = '${todoId}';
            `;

        await db.run(updateNewTodo);

        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //----Scenario 4----Due Date Updated--------------------------------
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDateForm = format(new Date(dueDate), "yyyy-MM-dd");

        const updateNewTodo = `
            UPDATE todo SET
            due_date = '${newDateForm}'
            WHERE id = '${todoId}';
            `;

        await db.run(updateNewTodo);
        response.send(`Due Date Updated`);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }

      break;
  }
});

//------------------------------API 6 -----------------------------------
//-----Deletes a todo from the todo table based on the todo ID-----------
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const delTodo = `
    DELETE FROM todo
    WHERE id = '${todoId}';
    `;

  const delData = await db.run(delTodo);
  response.send("Todo Deleted");
});

module.exports = app;
