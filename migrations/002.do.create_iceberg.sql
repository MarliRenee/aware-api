CREATE TABLE icebergs (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    modified TIMESTAMPTZ NOT NULL DEFAULT now(), 
    userId INTEGER REFERENCES aware_users(id) ON DELETE CASCADE NOT NULL 
);