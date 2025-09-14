// app/_components/FormPdfAvaliacao.js
"use client"

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer"

// Estilos aprimorados
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1E3A8A",
  },
  infoPaciente: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  sectionContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    border: "1 solid #CBD5E1",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1E40AF",
  },
  instrumentoNome: {
    fontWeight: "bold",
    marginTop: 6,
    fontSize: 12,
    color: "#1E3A8A",
  },
  separator: {
    height: 1,
    backgroundColor: "#CBD5E1",
    marginVertical: 8,
  },
  textContent: {
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 1.5,
  },
})

// Função para calcular idade
const calcularIdade = (dataNascimento) => {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesNascimento = nascimento.getMonth()
  const mesAtual = hoje.getMonth()
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

// Função para renderizar HTML simples (p, br, strong, table) com caracteres especiais tratados
const renderHtmlContent = (html) => {
  if (!html) return <Text>—</Text>

  // Substitui entidades HTML comuns e remove tags irrelevantes
  let cleanedHtml = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<\/?figure>/gi, '')
    .replace(/<\/?tbody>/gi, '')
    .replace(/<\/?thead>/gi, '')

  // Divide em blocos <p> ou <table>
  const blocks = cleanedHtml.split(/<\/p>|<\/table>/i)

  return blocks.map((block, idx) => {
    if (block.includes('<p')) {
      let content = block.replace(/<p[^>]*>/i, '').replace(/<br\s*\/?>/gi, '\n')
      const parts = content.split(/<strong>|<\/strong>/i)
      return (
        <Text key={idx} style={styles.textContent}>
          {parts.map((part, i) =>
            i % 2 === 1 ? <Text key={i} style={{ fontWeight: 'bold' }}>{part}</Text> : part
          )}
        </Text>
      )
    } else if (block.includes('<table')) {
      const rows = [...block.matchAll(/<tr>(.*?)<\/tr>/gi)].map((r) => r[1])
      return (
        <View
          key={idx}
          style={{
            display: 'table',
            width: 'auto',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000',
            marginBottom: 6,
          }}
        >
          {rows.map((row, rIdx) => {
            const cells = [...row.matchAll(/<t[dh]>(.*?)<\/t[dh]>/gi)].map((c) => c[1])
            return (
              <View key={rIdx} style={{ flexDirection: 'row', borderBottom: '1px solid #000' }}>
                {cells.map((cell, cIdx) => (
                  <Text
                    key={cIdx}
                    style={{
                      flex: 1,
                      borderRight: cIdx < cells.length - 1 ? '1px solid #000' : '0',
                      padding: 4,
                      fontSize: 12,
                    }}
                  >
                    {cell}
                  </Text>
                ))}
              </View>
            )
          })}
        </View>
      )
    }
    return null
  })
}

export default function FormPdfAvaliacao({ secoes = [], instrumentos = [], pacient }) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.header}>Relatório de Avaliação</Text>

        {/* Informações do paciente */}
        {pacient && (
          <View style={styles.infoPaciente}>
            <Text style={styles.infoText}>Nome: {pacient.nomePaciente || "______________________________________________________________________"}</Text>
            <Text style={styles.infoText}>Idade: {calcularIdade(pacient.dataNascimento)}</Text>
            <Text style={styles.infoText}>Data da Avaliação: ____/____/____</Text>
            <Text style={styles.infoText}>Aplicador:  {"________________________________________________________"}</Text>
          </View>
        )}

        {/* Seções do relatório */}
        {secoes.map((secao, idx) => (
          <View key={idx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{secao.titulo}</Text>

            {/* Para a seção de resultados de instrumentos, renderiza os resultados */}
            {secao.id === 4 ? (
              instrumentos.length > 0 ? (
                instrumentos.map((inst, i) => (
                  <View key={i}>
                    <Text style={styles.instrumentoNome}>► {inst.nome}</Text>
                    {renderHtmlContent(inst.resultado)}
                    {i < instrumentos.length - 1 && <View style={styles.separator} />}
                  </View>
                ))
              ) : (
                <Text>—</Text>
              )
            ) : (
              renderHtmlContent(secao.conteudo)
            )}
          </View>
        ))}
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 12, marginBottom: 40 }}>
            Assinatura do aplicador:
          </Text>
          <View style={{
            borderBottomWidth: 1,
            borderColor: '#000',
            width: '60%',
            height: 1,
          }} />
        </View>
      </Page>
    </Document>
  )
}
