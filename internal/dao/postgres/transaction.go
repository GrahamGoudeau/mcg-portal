package postgres

import "database/sql"

type transactionInProgress struct {
	tx *sql.Tx
}

func (t *transactionInProgress) GetPostgresTransaction() *sql.Tx {
	return t.tx
}
