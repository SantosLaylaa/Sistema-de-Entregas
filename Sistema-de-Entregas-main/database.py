import mysql.connector

def get_db_connection():
    try:
        conn = mysql.connector.connect (
            host = "localhost",
            user = "root",
            password = "",
            port = 3307,
            database = "entregasapp"
        )

        return conn
    
    except mysql.connector.Error as err:
        print(f"Error ao conectar: {err}")
        return None