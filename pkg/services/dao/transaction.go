package dao

import "database/sql"

type Transaction interface {
	GetPostgresTransaction() *sql.Tx
}
