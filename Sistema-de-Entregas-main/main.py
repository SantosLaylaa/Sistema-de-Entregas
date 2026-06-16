import os
import shutil
import mysql.connector
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from database import get_db_connection
from models import Aluno, Endereco, Entrega, Funcionario, Item, EntregaItem, Agendamento, Telefone, Atendente, Entregador, LoginRequest


app = FastAPI(title = "API Gestão de Entregas")

print("rodando")
# eu adicionei este bloco para permitir que o front-end acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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
    cursor.execute("SELECT * FROM aluno WHERE id = %s", (aluno_id,))
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
        conn.commit() # Estava escrito conn.comit()
        return {
            "mensagem": "Endereço cadastrado com sucesso", "id": cursor.lastrowid
        }
    except mysql.connector.Error as err: # Estava mysql.connect.Error
        raise HTTPException(status_code = 400, detail = f"Erro ao inserir endereço: {err}")
    finally:
        cursor.close() # Estava cursor.closed()
        conn.close()   # Estava conn.closed()

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

    valores = (item.nome,)

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
        
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 1. Passo extra: Buscar o ID do aluno usando a matrícula
        cursor.execute("SELECT id FROM aluno WHERE matricula = %s", (agendamento.matricula_aluno,))
        aluno_encontrado = cursor.fetchone()
        
        if not aluno_encontrado:
            raise HTTPException(status_code=404, detail="Matrícula não encontrada no sistema.")
            
        id_real_do_aluno = aluno_encontrado["id"]
        
        # 2. Agora sim, fazemos o insert normal no agendamento usando o ID real
        query = """
            INSERT INTO agendamento (id_aluno, data_agendada, horario) 
            VALUES (%s, %s, %s)
        """
        valores = (id_real_do_aluno, agendamento.data_agendada, agendamento.horario)
        
        cursor.execute(query, valores)
        conn.commit()
        
        return {
            "mensagem": "Agendamento registrado com sucesso", "id": cursor.lastrowid
        }
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code = 400, detail = f"Erro no banco: {err}")
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

        #------------------------------------------------------------
#- endpoint 13: Login do Aluno -

@app.post("/login/aluno")
def login_aluno(dados: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary = True)
    
    cursor.execute("SELECT * FROM aluno WHERE matricula = %s AND senha = %s", (dados.matricula, dados.senha))
    aluno = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if aluno:
        # Adicione o campo "nome" aqui:
        return {"mensagem": "Login aprovado!", "id": aluno["id"], "nome": aluno["nome"]}
    else:
        raise HTTPException(status_code = 401, detail = "Matrícula ou senha incorretos")

#------------------------------------------------------------
#- endpoint 14: Login do Funcionário -

@app.post("/login/funcionario")
@app.post("/login/funcionario")
def login_funcionario(dados: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Adicione estes prints
    print(f"DEBUG: Buscando matricula '{dados.matricula}' com senha '{dados.senha}'")
    
    cursor.execute("SELECT * FROM funcionario WHERE matricula = %s AND senha = %s", (dados.matricula, dados.senha))
    funcionario = cursor.fetchone()
    
    print(f"DEBUG: Funcionário retornado: {funcionario}")
    
    cursor.close()
    conn.close()

    if funcionario:
        return {"mensagem": "Login aprovado!", "id": funcionario["id"], "nome": funcionario["nome"]}
    else:
        raise HTTPException(status_code=401, detail="Matrícula ou senha incorretos")
    
    #------------------------------------------------------------
#- endpoint 15: listar agendamentos -

@app.get("/agendamentos")
def listar_agendamentos():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code = 500, detail = "Erro de banco de dados")
        
    cursor = conn.cursor(dictionary = True)
    
    # Fazemos um JOIN para cruzar o agendamento com a tabela de alunos
    query = """
        SELECT a.data_agendada, a.horario, al.nome as nome_aluno
        FROM agendamento a
        JOIN aluno al ON a.id_aluno = al.id
        ORDER BY a.data_agendada, a.horario
    """
    cursor.execute(query)
    agendamentos = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return agendamentos

#------------------------------------------------------------
#- endpoint 16: Receber Cadastro de Aluno com Fotos -

# Cria a pasta principal de uploads se ela não existir
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/solicitar-cadastro")
async def solicitar_cadastro(
    nome: str = Form(...),
    cpf: str = Form(...),
    email: str = Form(...),
    instituicao: str = Form(...),
    endereco: str = Form(...),
    senha: str = Form(...),
    doc_frente: UploadFile = File(...),
    doc_verso: UploadFile = File(...),
    comprovante: UploadFile = File(...)
):
    try:
        # Cria uma pasta específica para esse aluno baseada no CPF (sem pontuação)
        cpf_limpo = cpf.replace(".", "").replace("-", "")
        pasta_aluno = os.path.join(UPLOAD_DIR, f"aluno_{cpf_limpo}")
        os.makedirs(pasta_aluno, exist_ok=True)

        # Função para salvar cada arquivo
        def salvar_arquivo(arquivo: UploadFile, nome_arquivo: str):
            caminho_completo = os.path.join(pasta_aluno, nome_arquivo)
            with open(caminho_completo, "wb") as buffer:
                shutil.copyfileobj(arquivo.file, buffer)

        # Salva os 3 arquivos na pasta do aluno
        salvar_arquivo(doc_frente, f"frente_{doc_frente.filename}")
        salvar_arquivo(doc_verso, f"verso_{doc_verso.filename}")
        salvar_arquivo(comprovante, f"comprovante_{comprovante.filename}")

        return {"mensagem": "Documentos enviados com sucesso para análise!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivos: {str(e)}")
    
    #------------------------------------------------------------
#- endpoint 17: Login real com Google -

class GoogleToken(BaseModel):
    token: str

GOOGLE_CLIENT_ID = "593155284684-o53j329ehr5v0o2e5hhq4rvfk9ici6it.apps.googleusercontent.com"

@app.post("/login/google")
def login_google_real(dados: GoogleToken):
    try:
        # O Python bate na porta do Google e verifica se o token não é falso/hackeado
        idinfo = id_token.verify_oauth2_token(
            dados.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Se chegou aqui, o Google confirmou que a pessoa existe e está logada!
        email_google = idinfo['email']
        nome_google = idinfo['name']
        
        # COMO O SEU BANCO AINDA NÃO TEM E-MAIL, VAMOS SIMULAR A APROVAÇÃO
        # NO FUTURO, VOCÊ FARÁ UM: "SELECT * FROM aluno WHERE email = email_google"
        
        return {
            "mensagem": "Autenticado pelo Google com sucesso!", 
            "id": 999, # ID genérico temporário
            "nome": nome_google
        }
        
    except ValueError:
        # Se o token for falso ou expirado
        raise HTTPException(status_code=401, detail="Token do Google inválido ou expirado")