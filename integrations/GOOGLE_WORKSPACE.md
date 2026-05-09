# Google Workspace Connectors

## Gmail

- connector_id: google-gmail
- auth_type: oauth2
- read_actions: read threads, search inbox
- write_actions: create draft, send email
- approval_required: send email

## Google Drive

- connector_id: google-drive
- auth_type: oauth2
- read_actions: read selected files
- write_actions: create folder, delete file
- approval_required: create folder, delete file

## Google Docs

- connector_id: google-docs
- auth_type: oauth2
- read_actions: read selected document
- write_actions: create draft document
- approval_required: create draft document

## Google Sheets

- connector_id: google-sheets
- auth_type: oauth2
- read_actions: read selected sheet
- write_actions: create sheet, update cells
- approval_required: write/update cells

## Google Calendar

- connector_id: google-calendar
- auth_type: oauth2
- read_actions: read events
- write_actions: create draft event, invite guests
- approval_required: invite guests
