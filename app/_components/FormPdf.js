import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    color: '#333',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  profileInfo: {
    fontSize: 10,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  question: {
    marginBottom: 10,
  },
  answer: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
  line: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
    fontFamily: 'Courier',
  },
  bold: {
    fontWeight: 'bold',
  },
});

// Função para gerar linha tracejada
const gerarLinha = (tamanho = 60) => '―'.repeat(tamanho);

// Componente para exibir campo do paciente
const CampoPaciente = ({ label, value }) => (
  <Text>
    <Text style={styles.bold}>{label}: </Text>
    {value || ''}
  </Text>
);

export default function FormPdf({ perguntas, pacient, perfil }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho com título e perfil */}
        <View style={styles.header}>
          <Text style={styles.title}>Anamnese</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.bold}>{perfil.nomeUsuario}</Text>
            <Text>{perfil.email}</Text>
          </View>
        </View>

        {/* Dados do paciente */}
        <CampoPaciente label="Nome" value={pacient.nomePaciente} />
        <CampoPaciente label="Sexo" value={pacient.sexo} />
        <CampoPaciente label="Data de Nascimento" value={pacient.dataNascimento} />
        <CampoPaciente label="Escolaridade" value={pacient.serie} />
        <CampoPaciente label="Nome da Escola" value={pacient.escola} />
        <CampoPaciente label="Endereço" value={pacient.endereco} />
        <CampoPaciente label="Telefone" value={pacient.telefone} />
        <CampoPaciente label="Nome do Responsável" value={pacient.nomeResponsavel} />

        {/* Perguntas por seção */}
        {perguntas.map((secao, secaoIndex) => (
          <View key={secaoIndex}>
            <Text style={styles.sectionTitle}>{secao.titulo}</Text>
            {secao.perguntas.map((item, index) => {
              const resposta = typeof item.resposta === 'string' ? item.resposta.trim() : '';
              const tamanhoLinha = Math.max(60, Math.min(100, item.pergunta.length));

              return (
                <View key={index} style={styles.question}>
                  <Text>• {item.pergunta}</Text>
                  {resposta ? (
                    <Text style={styles.answer}>Resposta: {resposta}</Text>
                  ) : (
                    <>
                      <Text style={styles.line}>{gerarLinha(tamanhoLinha)}</Text>
                      <Text style={styles.line}>{gerarLinha(tamanhoLinha)}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        ))}

      </Page>
    </Document>
  );
}
