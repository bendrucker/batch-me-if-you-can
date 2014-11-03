# Schema

batch-me-if-you-can implements the following schema specification for requests and replies.

## Input

No keys other than those specified below should be permitted in requests. Requests that use unknown keys or do not adhere to the below schema should receive a `400` (Bad Request) response and should not be processed.

### Batch Request

Batch requests should be JSON strings with the following properties:

* `requests`: `Array` of length >= 1 containing objects conforming to the [`Request`](#individual-request) schema
* `parallel`: `Boolean` (optional) — overrides the server's default parallel setting

### Individual Request

* `path`: `String` — path of the desired route
* `method`: `String` (optional) — HTTP method, defaulting to `'GET'`
* `payload`: `Any` (optional) — A payload for the request

## Output

A status code of `400` indicates a malformed request body. A `500` status code indicates an internal error and may mean that the batch was partially processed. Otherwise, the response status code should always be `200` regardless of the success/failure of individual requests.

### Batch Response
A batch response should be a JSON string that encodes an `Array`. The contents of the array may be of any type, but errors should be objects with the following properties:

* `statusCode`: `Number` — the status code that would have been sent for the individual response
* `error`: `String` — a name for the error, e.g. `'Bad Request'` or `'Not Found'`
* `message`: `String` (optional) — a descriptive message with more information about the error

Unlike requests, error responses may implement additional unknown keys as long as they adhere to the above schema.
