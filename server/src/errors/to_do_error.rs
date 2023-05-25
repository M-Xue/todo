use axum::{http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug, strum_macros::AsRefStr)]
pub enum ToDoError {
    #[error("Iso8601 string could not be parsed to date")]
    Iso8601ParseError,
}

impl IntoResponse for ToDoError {
    fn into_response(self) -> axum::response::Response {
        // Create a placeholder axum response and put the error into the placeholder
        let mut response = StatusCode::INTERNAL_SERVER_ERROR.into_response();
        // Insert the Error into the response
        response.extensions_mut().insert(self);
        response
        // This is just a placeholder. The final response of an error will be constructed in the map_response middleware in main.
        // This includes the status code, client error message and the json body.
        // map_response middleware will let us log as we go.
    }
}

impl ToDoError {
    // This method will know how to convert a server error to a client error and status code
    pub fn client_status_and_error(&self) -> (StatusCode, ToDoClientError) {
        todo!()
    }
}

#[derive(Error, Debug, strum_macros::AsRefStr)]
// AsRefStr will allow us to serialize the enum variant as a string, which is what we will send back to the client
#[allow(non_camel_case_types)]
pub enum ToDoClientError {
    // LOGIN_FAIL,
    // NO_AUTH,
    // INVALID_PARAMS,
    // SERVICE_ERROR,
}

impl std::convert::From<chrono::format::ParseError> for ToDoError {
    fn from(_: chrono::format::ParseError) -> Self {
        ToDoError::Iso8601ParseError
    }
}
