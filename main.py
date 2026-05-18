from fastapi import FastAPI, HTTPException
from database import get_db_connection
from models import Aluno, Endereco, Entrega, Funcionario, Item, EntregaItem, Agendamento, Telefone, Atendente, Entregador
import mysql.connector

app = FastAPI(title = "API Gestão de Entregas")

#------------------------------------------------------------
#- teste do api funcionando -

@app.get("/")
def read_root():
    return {
        "mensagem": "API de Gestão de Entregas rodando. Acesse /docs para ver os endpoints."
    }

#------------------------------------------------------------
#- endpoint 1: listar alunos -

@app.get("/alunos")
def listar_alunos():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de conexão com o banco de dados")
    
    cursor = conn.cursor(dictionary = True)
    cursor.execute("SELECT * FROM aluno")
    alunos = cursor.fetchall()

    cursor.close()
    conn.close()
    return alunos

#------------------------------------------------------------
#- endpoint 2: cadastrar aluno -

@app.post("/alunos")
def criar_aluno(aluno: Aluno):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    
    query = """
        INSERT INTO aluno (nome, idade, cpf, rg, matricula, turma)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    valores = (aluno.nome, aluno.idade, aluno.cpf, aluno.rg, aluno.matricula, aluno.turma)

    try:
        cursor.execute(query, valores)
        conn.commit()
        id_inserido = cursor.lastrowid
        return {
            "mensagem": "Aluno cadastrado com sucesso", "id": id_inserido
        }
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code = 400, detail = "CPF ou RG já cadastrados no sistema.")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 3: buscar aluno -

@app.get("/alunos/{aluno_id}")
def buscar_aluno(aluno_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor(dictionary = True)
    cursor.execute("SELECT * FROM aluno WHERE id = %s", (aluno_id))
    aluno = cursor.fetchone()

    cursor.close()
    conn.close()

    if not aluno:
        raise HTTPException(status_code = 404, detail = "Aluno não encontrado")
    return aluno

#------------------------------------------------------------
#- endpoint 4: cadastrar endereço -

@app.post("/enderecos")
def criar_endereco(endereco: Endereco):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    query = """
        INSERT INTO endereco (id_aluno, cep, logradouro, numero, complemento, bairro, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    valores = (endereco.id_aluno, endereco.cep, endereco.logradouro, endereco.numero, endereco.complemento, endereco.bairro, endereco.estado)

    try:
        cursor.execute(query, valores)
        conn.comit()
        return {
            "mensagem": "Endereço cadastrado com sucesso", "id": cursor.lastrowid
        }
    except mysql.connect.Error as err:
        raise HTTPException(status_code = 400, detail = "Erro ao inserir endereço: {err}")
    finally:
        cursor.closed()
        conn.closed()

#------------------------------------------------------------
#- endpoint 5: registrar entrega nova -

@app.post("/entregas")
def criar_entrega(entrega: Entrega):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    query = """
        INSERT INTO entrega (id_aluno, id_funcionario, data_entrega, status)
        VALUES (%s, %s, %s, %s)
    """

    valores = (entrega.id_aluno, entrega.id_funcionario, entrega.data_entrega, entrega.status)

    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Entrega registrada com sucesso", "id": cursor.lastrowid
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro de integridade: {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 6: cadastrar funcionario -

@app.post("/funcionarios")
def criar_funcionario(funcionario: Funcionario):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    query = """
        INSERT INTO funcionario (nome, matricula) VALUES (%s, %s)
    """

    valores = (funcionario.nome, funcionario.matricula)
    
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Funcionário cadastrado com sucesso", "id": cursor.lastrowid}
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = "Erro ao inserir funcionário: {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 7: cadastrar item e/ou material -

@app.post("/itens")
def criar_item(item: Item):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    query = """
        INSERT INTO item (nome) VALUES (%s)
    """

    valores = (item.nome)

    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Item cadastrado com sucesso", "id": cursor.lastrowid
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = "Erro ao inserir item: {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 8: adicionar item a uma entrega -

@app.post("/entregas/itens")
def vincular_item_entrega(entrega_item: EntregaItem):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
    
    cursor = conn.cursor()
    query = """
        INSERT INTO entrega_item (id_entrega, id_item)
        VALUES (%s, %s)
    """

    valores = (entrega_item.id_entrega, entrega_item.id_item)

    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
        "mensagem": "Item vinculado à entrega com sucesso"
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro de integridade (verifique se ID da entrega e do item existem): {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 9: criar agendamento -

@app.post("/agendamentos")
def criar_agendamento(agendamento: Agendamento):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail= "Erro de banco de dados")
        
    cursor = conn.cursor()
    query = """
        INSERT INTO agendamento (id_aluno, data_agendada, horario) 
        VALUES (%s, %s, %s)
    """

    valores = (agendamento.id_aluno, agendamento.data_agendada, agendamento.horario)
    
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Agendamento registrado com sucesso", "id": cursor.lastrowid
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro de integridade (Verifique se o ID do aluno existe): {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 10: cadastrar telefone -

@app.post("/telefones")
def criar_telefone(telefone: Telefone):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail= "Erro de banco de dados")
        
    cursor = conn.cursor()
    query = """
        INSERT INTO telefone (id_aluno, ddd, numero) VALUES (%s, %s, %s)
    """

    valores = (telefone.id_aluno, telefone.ddd, telefone.numero)
    
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Telefone cadastrado com sucesso", "id": cursor.lastrowid
            }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro ao inserir telefone (Verifique o ID do aluno): {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 11: cadastrar atendente -

@app.post("/atendentes")
def criar_atendente(atendente: Atendente):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
        
    cursor = conn.cursor()
    query = """
        INSERT INTO atendente (id_funcionario, guiche) VALUES (%s, %s)
    """

    valores = (atendente.id_funcionario, atendente.guiche)
    
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Atendente registrado com sucesso"
            }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro ao registrar atendente (Verifique se o ID do funcionário existe): {err}")
    finally:
        cursor.close()
        conn.close()

#------------------------------------------------------------
#- endpoint 12: cadastrar entregador -

@app.post("/entregadores")
def criar_entregador(entregador: Entregador):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
        
    cursor = conn.cursor()
    query = """
        INSERT INTO entregador (id_funcionario, zona_entrega) VALUES (%s, %s)
    """

    valores = (entregador.id_funcionario, entregador.zona_entrega)
    
    try:
        cursor.execute(query, valores)
        conn.commit()
        return {
            "mensagem": "Entregador registrado com sucesso"
        }
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro ao registrar entregador (Verifique se o ID do funcionário existe): {err}")
    finally:
        cursor.close()
        conn.close()