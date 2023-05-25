use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ToDoError {
    #[error("Iso8601 string could not be parsed to date")]
    Iso8601ParseError,
}

// TODO: WTF is this
impl IntoResponse for ToDoError {
    fn into_response(self) -> axum::response::Response {
        println!("->> {:12} - {self:?}", "INTO_RES");

        // Version 1
        // Never pass through your server error to the client because that is a security exposure
        // Have the lazy path be the default path
        // Want to give server all the info and cherry pick what to send to client
        // (StatusCode::INTERNAL_SERVER_ERROR, "UNHANDLED_CLIENT_ERROR").into_response()

        // Version 2
        // Create a placeholder axum response and put the error into the placeholder
        let mut response = StatusCode::INTERNAL_SERVER_ERROR.into_response();
        // Insert the Error into the response
        response.extensions_mut().insert(self);
        response
        // This is just a placeholder. The magic is going to happen in the map_response middleware
    }
}

impl std::convert::From<chrono::format::ParseError> for ToDoError {
    fn from(err: chrono::format::ParseError) -> Self {
        ToDoError::Iso8601ParseError
    }
}
