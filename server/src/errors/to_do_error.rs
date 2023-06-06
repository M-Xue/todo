use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

use super::client_error::{ClientError, Error};

#[derive(Error, Debug, strum_macros::AsRefStr)]
pub enum ToDoError {
    #[error("Iso8601 string could not be parsed to date")]
    Iso8601ParseError,
    #[error("Database Error")]
    DatabaseError(sqlx::Error),
    #[error("Incorrect parameters for creating to do item")]
    CreateToDoParamError(String),
}

impl IntoResponse for ToDoError {
    fn into_response(self) -> axum::response::Response {
        // Create a placeholder axum response and put the error into the placeholder
        // Any ToDoError should be an INTERNAL_SERVICE_ERROR ()
        let mut response = StatusCode::INTERNAL_SERVER_ERROR.into_response();
        // Insert the Error into the response
        let err_extension: Box<dyn Error + Send + Sync> = Box::new(self);
        response.extensions_mut().insert(err_extension);
        response
        // This is just a placeholder. The final response of an error will be constructed in the map_response middleware in main.
        // This includes the status code, client error message and the json body.
        // map_response middleware will let us log as we go.
    }
}

impl Error for ToDoError {
    // This method will know how to convert a server error to a client error and status code
    fn client_status_and_error(&self) -> (StatusCode, ClientError) {
        match self {
            ToDoError::Iso8601ParseError
            | ToDoError::DatabaseError(_)
            | ToDoError::CreateToDoParamError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                ClientError::SERVICE_ERROR,
            ),
        }
    }
    fn get_error_info(&self) -> (String, String) {
        match self {
            ToDoError::Iso8601ParseError => (
                "ISO8601 parse error".to_string(),
                "Internal error occurred when parsing ISO8601 for date".to_string(),
            ),
            ToDoError::DatabaseError(db_err) => ("Database Error".to_string(), db_err.to_string()),
            ToDoError::CreateToDoParamError(param) => (
                "Create To Do Param Error".to_string(),
                format!("Missing {} parameter for creating to do item", param),
            ),
        }
    }
}

impl std::convert::From<chrono::format::ParseError> for ToDoError {
    fn from(_: chrono::format::ParseError) -> Self {
        ToDoError::Iso8601ParseError
    }
}
