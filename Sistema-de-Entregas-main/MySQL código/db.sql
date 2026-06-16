create database entregasapp;

use entregasapp;

create table aluno(
	id int not null auto_increment primary key,
    nome varchar(100) not null,
    idade smallint null,
    cpf varchar(14) not null unique,
    rg varchar(20) not null unique,
    data_nascimento date null,
    matricula varchar(50) not null,
    turma varchar(10) not null,
	senha varchar(100) not null
);

create table endereco(
	id int not null auto_increment primary key,
    id_aluno int not null,
    cep varchar(9),
    logradouro varchar(150) not null,
    numero int not null,
    complemento varchar(50),
    bairro varchar(50),
    estado varchar(20),
    constraint fk_endereco_aluno foreign key(id_aluno) references aluno(id)
);

create table telefone(
	id int not null auto_increment primary key,
    id_aluno int not null,
    ddd varchar(2) not null,
    numero varchar(10) not null,
    constraint fk_telefone_aluno foreign key(id_aluno) references aluno(id)
);


create table funcionario(
	id int not null auto_increment primary key,
    nome varchar(100) not null,
    matricula varchar(50) not null,
	senha varchar(100) not null
);

create table atendente(
	id_funcionario int not null primary key,
    guiche varchar(10),
    constraint fk_atendente_funcionario foreign key(id_funcionario) references funcionario(id)
);

create table entregador(
	id_funcionario int not null primary key,
    zona_entrega varchar(80),
    constraint fk_entregador_funcionario foreign key(id_funcionario) references funcionario(id)
);

create table entrega(
	id int not null auto_increment primary key,
    id_aluno int not null,
    id_funcionario int not null,
    data_entrega date,
    status varchar(30) not null,
    constraint fk_entrega_aluno foreign key(id_aluno) references aluno(id),
    constraint fk_entrega_funcionario foreign key(id_funcionario) references funcionario(id)
);

create table item(
	id int not null auto_increment primary key,
    nome varchar(50) not null
);

create table entrega_item(
	id_entrega int,
    id_item int,
    primary key(id_entrega, id_item),
    constraint fk_entrega_item_entrega foreign key(id_entrega) references entrega(id),
    constraint fk_entrega_item_item foreign key(id_item) references item(id)
);

create table agendamento(
	id int auto_increment primary key,
    id_aluno int,
    data_agendada date,
    horario varchar(10),
    constraint fk_agendamento_aluno foreign key(id_aluno) references aluno(id)
);
