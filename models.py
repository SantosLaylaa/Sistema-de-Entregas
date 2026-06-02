from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class Aluno(BaseModel):
    id: int
    nome: str
    idade: int
    cpf: str
    rg: str
    matricula: str
    turma: str

class Endereco(BaseModel):
    id_aluno: int
    cep: str
    logradouro: str
    numero: int
    complemento: Optional[str] = None #opcional porque nem todo endereço tem
    bairro: str
    estado: str

class Entrega(BaseModel):
    id_aluno: int
    id_funcionario: int
    data_entrega: date #esperado que seja dd-mm-aaaa
    status: str

class Funcionario(BaseModel):
    id: int
    nome: str
    matricula: str

class Item(BaseModel):
    id: int
    nome: str

class EntregaItem(BaseModel):
    id_entrega: int
    id_item: int

class Agendamento(BaseModel):
    id_aluno: int
    data_agendada: date #esperando dd-mm-aaaa
    horario: time #esperado que seja hh-mm

class Telefone(BaseModel):
    id_aluno: int
    ddd: str
    numero: str

class Atendente(BaseModel):
    id_funcionario: int
    guiche: Optional[str] = None

class Entregador(BaseModel):
    id_funcionario: int
    zona_entrega: Optional[str] = None
