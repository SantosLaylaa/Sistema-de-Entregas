import mysql.connector

def get_db_connection():
    try:
        conn = mysql.connector.connect (
            host = "host",
            user = "root",
            password = "",
            database = "entregasapp"
        )

        return conn
    
    except mysql.connector.Error as err:
        print(f"Error ao conectar: {err}")
        return None