// src/permissions/mod.rs

use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Database {
    // Add fields as necessary
}

#[derive(Serialize, Deserialize)]
struct User {
    // Add fields as necessary
}

#[derive(Serialize, Deserialize)]
struct Agent {
    // Add fields as necessary
}

#[derive(Serialize, Deserialize)]
struct Access {
    // Add fields as necessary
}

async fn create_database(_db: web::Json<Database>) -> HttpResponse {
    // Add database creation logic here
    HttpResponse::Ok().finish()
}

async fn read_databases() -> HttpResponse {
    // Add database reading logic here
    HttpResponse::Ok().finish()
}

async fn update_database(_id: String, _db: web::Json<Database>) -> HttpResponse {
    // Add database update logic here
    HttpResponse::Ok().finish()
}

async fn delete_database(_id: String) -> HttpResponse {
    // Add database deletion logic here
    HttpResponse::Ok().finish()
}

async fn create_user(_user: web::Json<User>) -> HttpResponse {
    // Add user creation logic here
    HttpResponse::Ok().finish()
}

async fn read_users() -> HttpResponse {
    // Add user reading logic here
    HttpResponse::Ok().finish()
}

async fn update_user(_id: String, _user: web::Json<User>) -> HttpResponse {
    // Add user update logic here
    HttpResponse::Ok().finish()
}

async fn delete_user(_id: String) -> HttpResponse {
    // Add user deletion logic here
    HttpResponse::Ok().finish()
}

async fn create_agent(_agent: web::Json<Agent>) -> HttpResponse {
    // Add agent creation logic here
    HttpResponse::Ok().finish()
}

async fn read_agents() -> HttpResponse {
    // Add agent reading logic here
    HttpResponse::Ok().finish()
}

async fn update_agent(_id: String, _agent: web::Json<Agent>) -> HttpResponse {
    // Add agent update logic here
    HttpResponse::Ok().finish()
}

async fn delete_agent(_id: String) -> HttpResponse {
    // Add agent deletion logic here
    HttpResponse::Ok().finish()
}

async fn create_access(_access: web::Json<Access>) -> HttpResponse {
    // Add access creation logic here
    HttpResponse::Ok().finish()
}

async fn read_access() -> HttpResponse {
    // Add access reading logic here
    HttpResponse::Ok().finish()
}

async fn update_access(_id: String, _access: web::Json<Access>) -> HttpResponse {
    // Add access update logic here
    HttpResponse::Ok().finish()
}

async fn delete_access(_id: String) -> HttpResponse {
    // Add access deletion logic here
    HttpResponse::Ok().finish()
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/databases", web::post().to(create_database))
        .route("/databases", web::get().to(read_databases))
        .route("/databases/{id}", web::put().to(update_database))
        .route("/databases/{id}", web::delete().to(delete_database))
        .route("/users", web::post().to(create_user))
        .route("/users", web::get().to(read_users))
        .route("/users/{id}", web::put().to(update_user))
        .route("/users/{id}", web::delete().to(delete_user))
        .route("/agents", web::post().to(create_agent))
        .route("/agents", web::get().to(read_agents))
        .route("/agents/{id}", web::put().to(update_agent))
        .route("/agents/{id}", web::delete().to(delete_agent))
        .route("/access", web::post().to(create_access))
        .route("/access", web::get().to(read_access))
        .route("/access/{id}", web::put().to(update_access))
        .route("/access/{id}", web::delete().to(delete_access));
}

/// Enum representing possible permissions
#[derive(Debug, PartialEq, Eq, Clone)]
pub enum Permission {
    ALL,      // Full access
    GROUP,    // Group-level access
    OTHERS,   // Access for others
    OWNER,    // Owner-only access
    Custom(String), // Optional: Allows dynamic custom permissions
}

/// Struct representing a role with a name and a list of permissions
#[derive(Debug, Clone)]
pub struct Role {
    name: String,
    permissions: Vec<Permission>,
}

/// Manages a collection of roles
#[derive(Debug, Default)]
pub struct RoleManager {
    roles: Vec<Role>,
}

impl Role {
    /// Creates a new role with the given name and permissions
    pub fn new(name: &str, permissions: Vec<Permission>) -> Self {
        Role {
            name: name.to_string(),
            permissions,
        }
    }

    /// Checks if the role has a specific permission
    pub fn can_access(&self, permission: &Permission) -> bool {
        self.permissions.contains(permission)
    }

    /// Adds a permission to the role
    pub fn add_permission(&mut self, permission: Permission) {
        if !self.permissions.contains(&permission) {
            self.permissions.push(permission);
        }
    }

    /// Removes a permission from the role
    pub fn remove_permission(&mut self, permission: &Permission) {
        self.permissions.retain(|p| p != permission);
    }

    /// Returns the role's name
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the role's permissions
    pub fn permissions(&self) -> &Vec<Permission> {
        &self.permissions
    }
}

impl RoleManager {
    /// Creates a new RoleManager
    pub fn new() -> Self {
        RoleManager { roles: Vec::new() }
    }

    /// Adds a new role to the manager
    pub fn create_role(&mut self, name: &str, permissions: Vec<Permission>) -> &Role {
        let role = Role::new(name, permissions);
        self.roles.push(role);
        self.roles.last().unwrap() // Return reference to the newly created role
    }

    /// Finds a role by name
    pub fn get_role(&self, name: &str) -> Option<&Role> {
        self.roles.iter().find(|role| role.name == name)
    }

    /// Updates permissions for an existing role
    pub fn update_role_permissions(&mut self, name: &str, permissions: Vec<Permission>) -> bool {
        if let Some(role) = self.roles.iter_mut().find(|role| role.name == name) {
            role.permissions = permissions;
            true
        } else {
            false
        }
    }

    /// Deletes a role by name
    pub fn delete_role(&mut self, name: &str) -> bool {
        let initial_len = self.roles.len();
        self.roles.retain(|role| role.name != name);
        self.roles.len() < initial_len
    }

    /// Lists all roles
    pub fn list_roles(&self) -> &Vec<Role> {
        &self.roles
    }
}

// Example usage
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dynamic_roles() {
        let mut manager = RoleManager::new();

        // Create a role dynamically
        let admin_perms = vec![Permission::ALL, Permission::OWNER];
        manager.create_role("admin", admin_perms);
        
        // Create another role
        let user_perms = vec![Permission::GROUP, Permission::OTHERS];
        manager.create_role("user", user_perms);

        // Check permissions
        let admin = manager.get_role("admin").unwrap();
        assert!(admin.can_access(&Permission::ALL));
        assert!(!admin.can_access(&Permission::GROUP));

        let user = manager.get_role("user").unwrap();
        assert!(user.can_access(&Permission::GROUP));
        assert!(!user.can_access(&Permission::ALL));

        // Update a role
        manager.update_role_permissions("user", vec![Permission::ALL]);
        let updated_user = manager.get_role("user").unwrap();
        assert!(updated_user.can_access(&Permission::ALL));
    }
}