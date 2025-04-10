use rocket::serde::{Deserialize, Serialize};
use rocket_db_pools::{sqlx, Database};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone)]
struct User {
    id: i64,
    name: String,
    email: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Agent {
    id: i64,
    name: String,
    role: String,
}

#[derive(Database)]
#[database("my_database")]
struct MyDatabase(sqlx::PgPool);

#[get("/users")]
async fn get_users(db: &MyDatabase) -> Result<Vec<User>, sqlx::Error> {
    let users = sqlx::query_as!(User, "SELECT id, name, email FROM users")
        .fetch_all(&db.0)
        .await?;
    Ok(users)
}

#[post("/users", format = "json", data = "<user>")]
async fn create_user(db: &MyDatabase, user: User) -> Result<(), sqlx::Error> {
    sqlx::query!("INSERT INTO users (name, email) VALUES ($1, $2)", user.name, user.email)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[put("/users/<id>", format = "json", data = "<user>")]
async fn update_user(db: &MyDatabase, id: i64, user: User) -> Result<(), sqlx::Error> {
    sqlx::query!("UPDATE users SET name = $1, email = $2 WHERE id = $3", user.name, user.email, id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[delete("/users/<id>")]
async fn delete_user(db: &MyDatabase, id: i64) -> Result<(), sqlx::Error> {
    sqlx::query!("DELETE FROM users WHERE id = $1", id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[get("/agents")]
async fn get_agents(db: &MyDatabase) -> Result<Vec<Agent>, sqlx::Error> {
    let agents = sqlx::query_as!(Agent, "SELECT id, name, role FROM agents")
        .fetch_all(&db.0)
        .await?;
    Ok(agents)
}

#[post("/agents", format = "json", data = "<agent>")]
async fn create_agent(db: &MyDatabase, agent: Agent) -> Result<(), sqlx::Error> {
    sqlx::query!("INSERT INTO agents (name, role) VALUES ($1, $2)", agent.name, agent.role)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[put("/agents/<id>", format = "json", data = "<agent>")]
async fn update_agent(db: &MyDatabase, id: i64, agent: Agent) -> Result<(), sqlx::Error> {
    sqlx::query!("UPDATE agents SET name = $1, role = $2 WHERE id = $3", agent.name, agent.role, id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[delete("/agents/<id>")]
async fn delete_agent(db: &MyDatabase, id: i64) -> Result<(), sqlx::Error> {
    sqlx::query!("DELETE FROM agents WHERE id = $1", id)
        .execute(&db.0)
        .await?;
    Ok(())
}

#[get("/access")]
async fn get_access() -> HashMap<String, Vec<String>> {
    let access: HashMap<String, Vec<String>> = vec![
        ("user".to_string(), vec!["read".to_string(), "write".to_string()]),
        ("agent".to_string(), vec!["read".to_string(), "write".to_string(), "delete".to_string()]),
    ]
    .into_iter()
    .collect();
    access
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .attach(MyDatabase::fairing())
        .mount("/", routes![get_users, create_user, update_user, delete_user])
        .mount("/agents", routes![get_agents, create_agent, update_agent, delete_agent])
        .mount("/access", routes![get_access])
}
