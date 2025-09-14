"use server";
import {auth, signIn, signOut} from "./auth"
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { getPacientById} from "@/app/_lib/data-service";
import { redirect } from 'next/navigation';

// const supabase = createClient()

export async function signInAction(){
    await signIn("google", {redirectTo: '/conta'})
}

export async function signOutAction(){
    await signOut({redirectTo: '/'})
}

export async function updateProfile(formData) {
    const session = await auth()

    if (!session) throw new Error("Você precisa estar logado para realizar essa ação")
        
    const nacionalidade = formData.get("nacionalidade")
    const idioma = formData.get("idioma")
    
    const updateData = {nacionalidade, idioma}
    
    console.log(updateData)

    const { data, error } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", session.user.userId)
        
    if (error) throw new Error("usuario could not be updated");

    revalidatePath("conta")
}

export async function deletePacient(PacientId) {
  const session = await auth()

  if (!session) {
    throw new Error("Você precisa estar logado para realizar essa ação")
  }

  // 1. Buscar sessões do paciente
  const { data: sessoes, error: erroSessoes } = await supabase
    .from("sessoes")
    .select("id")
    .eq("id_paciente", PacientId)

  if (erroSessoes) {
    console.error(erroSessoes)
    throw new Error("Erro ao buscar sessões do paciente")
  }

  if (sessoes && sessoes.length > 0) {
    const sessaoIds = sessoes.map(s => s.id)

    // 2. Deletar tabelas filhas das sessões primeiro
    const tabelasFilhas = ["sessao_instrumentos", "sessao_hipoteses"]

    for (const tabela of tabelasFilhas) {
      const { error } = await supabase
        .from(tabela)
        .delete()
        .in("sessao_id", sessaoIds)

      if (error) {
        console.error(error)
        throw new Error(`Erro ao deletar registros em ${tabela}`)
      }
    }

    // 3. Agora pode apagar as sessões
    const { error: erroDelSessoes } = await supabase
      .from("sessoes")
      .delete()
      .eq("id_paciente", PacientId)

    if (erroDelSessoes) {
      console.error(erroDelSessoes)
      throw new Error("Erro ao deletar sessões")
    }
  }

  // 4. Deletar tabelas que têm relação direta com paciente
  const tabelasRelacionadas = [
    "resumos",
    "respostas",
    "hipoteses",
    "arquivos",
    "relatorio_avaliacao"
  ]

  for (const tabela of tabelasRelacionadas) {
    const { error } = await supabase
      .from(tabela)
      .delete()
      .eq("id_paciente", PacientId)

    if (error) {
      console.error(error)
      throw new Error(`Erro ao deletar registros em ${tabela}`)
    }
  }

  // 5. Por último, deletar o paciente
  const { error: pacienteError } = await supabase
    .from("pacientes")
    .delete()
    .eq("id", PacientId)

  if (pacienteError) {
    console.error(pacienteError)
    throw new Error("Erro ao deletar paciente")
  }

  revalidatePath("/pacientes")
}



 
        
export async function registerPacient(formData) {
  const session = await auth();
  if (!session) throw new Error("Você precisa estar logado para realizar essa ação");

  const usuarioId = session.user.userId;
  
  // Extrair campos do formulário
  const nomePaciente = formData.get("nomePaciente");
  const dataNascimento = formData.get("dataNascimento");
  const nomeResponsavel = formData.get("nomeResponsavel");
  const escola = formData.get("escola");
  const serie = formData.get("serie");
  const sexo = formData.get("sexo");
  const telefone = formData.get("telefone");
  const cpf = formData.get("cpf");
  const email = formData.get("email");
  const endereco = formData.get("endereco");
  const status = formData.get("status");
  const queixa = formData.get("queixa");
  const tipoIntervencao = formData.get("tipoIntervencao");
  const descricaoLaudo = formData.get("descricaoLaudo");
  const motivoIntervencao = formData.get("motivoIntervencao");
  const observacoes = formData.get("observacoes");
  const imagemFile = formData.get("imagem"); // o arquivo (File)
  console.log(formData)
  
  let imageUrl = null;

  const isImagemValida =
    imagemFile &&
    typeof imagemFile.name === "string" &&
    imagemFile.name !== "undefined" &&
    imagemFile.size > 0 &&
    imagemFile.type.startsWith("image/");
   

  if (isImagemValida) {
    const filePath = `pacientes/${Date.now()}_${imagemFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, imagemFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      throw new Error("Erro ao fazer upload da imagem");
    }

    // Obtem URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from("files")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData?.publicUrl || null;
  }

  // Dados a serem inseridos
  const createData = {
    nomePaciente,
    dataNascimento,
    nomeResponsavel,
    escola,
    serie,
    sexo,
    telefone,
    cpf,
    email,
    endereco,
    status,
    queixa,
    tipoIntervencao,
    descricaoLaudo,
    motivoIntervencao,
    observacoes,
    imagem: imageUrl, // ← URL da imagem
    usuarioId,
  };
  console.log(createData)

  const { error } = await supabase.from("pacientes").insert([createData]);

  if (error) {
    console.error(error);
    throw new Error("Erro ao cadastrar paciente");
  }

  revalidatePath("/pacientes");
  redirect("/pacientes");
}


export async function editPacient(formData) {
  const id = parseInt(formData.get("id"));
  const imagemFile = formData.get("imagem");

  const pacienteAtual = await getPacientById(id);

  let imageUrl = pacienteAtual.imagem; // valor padrão: imagem antiga

  // 📤 Upload da imagem se o arquivo for válido (tem nome e tamanho > 0)
  if (imagemFile && imagemFile.name && imagemFile.size > 0) {
    const filePath = `pacientes/${Date.now()}_${imagemFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, imagemFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      throw new Error("Erro ao fazer upload da imagem");
    }

    const { data: publicUrlData } = supabase
      .storage
      .from("files")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData?.publicUrl ?? null;
  }

  const updateData = {
    nomePaciente: formData.get("nomePaciente"),
    dataNascimento: formData.get("dataNascimento"),
    nomeResponsavel: formData.get("nomeResponsavel"),
    escola: formData.get("escola"),
    serie: formData.get("serie"),
    sexo: formData.get("sexo"),
    telefone: formData.get("telefone"),
    cpf: formData.get("cpf"),
    email: formData.get("email"),
    endereco: formData.get("endereco"),
    status: formData.get("status"),
    queixa: formData.get("queixa"),
    tipoIntervencao: formData.get("tipoIntervencao"),
    descricaoLaudo: formData.get("descricaoLaudo"),
    motivoIntervencao: formData.get("motivoIntervencao"),
    observacoes: formData.get("observacoes"),
    imagem: imageUrl,
  };

  const { error } = await supabase
    .from("pacientes")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Erro ao editar paciente");
  }

  revalidatePath("pacientes");
  revalidatePath(`/pacientes/${id}`);
  revalidatePath(`/pacientes/${id}/editar`);
  redirect("/pacientes");
}


export async function buscarPerguntas(idFormulario, idPaciente) {
  console.log(idPaciente)

  revalidatePath(`/pacientes/${idPaciente}/anamnese`);

  const { data, error } = await supabase
    .from('perguntas')
    .select(`
      id_pergunta,
      pergunta,
      tipo_resposta,
      secao,
      extraOn,
      extra,
      respostas (
        id_resposta,
        id_paciente,
        resposta,
        selecionada
      )
    `)
    .eq('id_formulario', idFormulario)
    .order('id_pergunta')

  if (error) {
    console.error(error)
    return []
  }
  // console.log('idPaciente:', idPaciente, typeof idPaciente)
  // Junta a resposta (se existir) direto no objeto da pergunta
  return data.map(p => {
  // console.log(`Pergunta ${p.id_pergunta}`, p.respostas);
  const respostaPaciente = p.respostas?.find(r => Number(r.id_paciente) === Number(idPaciente));
  // console.log('Resposta do paciente:', respostaPaciente);
  return {
    ...p,
    id_resposta: respostaPaciente?.id_resposta || null,
    resposta: respostaPaciente?.resposta || '',
    selecionada: respostaPaciente?.selecionada ?? true
  }
})}

export async function buscarPerguntasComRespostas(idFormulario, idPaciente) {
  console.log(idPaciente)

  revalidatePath(`/pacientes/${idPaciente}/anamnese`);

  const { data, error } = await supabase
    .from('perguntas')
    .select(`
      id_pergunta,
      pergunta,
      tipo_resposta,
      secao,
      extraOn,
      extra,
      respostas (
        id_resposta,
        id_paciente,
        resposta,
        selecionada
      )
    `)
    .eq('id_formulario', idFormulario)
    .order('id_pergunta')

  if (error) {
    console.error(error)
    return []
  }

  return data
    .map(p => {
      const respostaPaciente = p.respostas?.find(
        r => Number(r.id_paciente) === Number(idPaciente)
      )
      if (!respostaPaciente) {
        return null // não retorna perguntas sem resposta do paciente
      }
      return {
        ...p,
        id_resposta: respostaPaciente.id_resposta,
        resposta: respostaPaciente.resposta,
        selecionada: respostaPaciente.selecionada ?? true
      }
    })
    .filter(Boolean) // remove os nulls
}


export async function salvarRespostas(idFormulario, idPaciente, formData) {
  // Busca todas as perguntas do formulário
  const perguntas = await buscarPerguntas(idFormulario, idPaciente)
  console.log(perguntas.id_pergunta)

  for (const pergunta of perguntas) {
    const valor = formData.get(`resposta_${pergunta.id_pergunta}`) || ''
    const selecionada = idFormulario === 1
      ? formData.get(`selecionada_${pergunta.id_pergunta}`) === '1'
      : true

    // Consulta se já existe resposta no banco para essa pergunta e paciente
    const { data: existente, error } = await supabase
      .from('respostas')
      .select('*')
      .eq('id_pergunta', pergunta.id_pergunta)
      .eq('id_paciente', idPaciente)
      .single() // pega apenas 1 registro, se existir

    if (error && error.code !== 'PGRST116') { // ignora "no rows found"
      console.error('Erro ao verificar resposta existente:', error)
      continue
    }

    if (existente) {
      // Se existir, atualiza apenas se houver alteração
      if (existente.resposta !== valor || existente.selecionada !== selecionada) {
        await supabase
          .from('respostas')
          .update({ resposta: valor, selecionada })
          .eq('id_pergunta', pergunta.id_pergunta)
          .eq('id_paciente', idPaciente)
      }
    } else {
      // Se não existir, insere nova resposta
      await supabase
        .from('respostas')
        .insert({
          id_pergunta: pergunta.id_pergunta,
          id_paciente: idPaciente,
          resposta: valor,
          selecionada
        })
    }
  }
}

export async function salvarResumoAnamnese( idPaciente, resumo) {

    const { data: existente, error } = await supabase
      .from('resumos')
      .select('*')
      .eq('id_paciente', idPaciente)
      .single() // pega apenas 1 registro, se existir


    if (existente) {
      // Se existir, atualiza apenas se houver alteração
        await supabase
          .from('resumos')
          .update({ resumo_anamnese: resumo})
          .eq('id_paciente', idPaciente)
      
    } else {
      // Se não existir, insere nova resposta
      await supabase
        .from('resumos')
        .insert({
          id_paciente: idPaciente,
          resumo_anamnese: resumo,
        })
    }
  }



export async function getResumoAnamnese(idPaciente) {
  const { data, error } = await supabase
    .from('resumos')
    .select('resumo_anamnese')
    .eq('id_paciente', idPaciente)
    .single();

  if (error) {
    console.error("Erro ao buscar resumo da anamnese:", error);
    return null;
  }

  return data?.resumo_anamnese || null;
}

export async function getHipoteses(idPaciente) {

  const { data, error } = await supabase
    .from("hipoteses")
    .select("*")
    .eq("id_paciente", idPaciente)
    // .maybeSingle()

  if (error) {
    console.error("Erro ao buscar hipoteses:", error);
    return [];
  }

   // Converte os campos JSON string em arrays
  const hipoteses = data.map(h => ({
    ...h,
    formas_avaliacao: h.formas_avaliacao ? JSON.parse(h.formas_avaliacao) : [],
    construtos: h.construtos ? JSON.parse(h.construtos) : [],
    origem: h.origem 
  }));

  return hipoteses;
}
export async function getInstrumentos() {
  const { data, error } = await supabase
    .from("instrumentos")
    .select("*")

  if (error) {
    console.error("Erro ao buscar instrumentos:", error)
    return {}
  }

   const instrumentosPorCategoria = data.reduce((acc, inst) => {
        const categoria = inst.categoria || "Outros";

        const instrumentoConvertido = {
          ...inst,
          construtos: parsePostgresArray(inst.construtos),
          areasProfissionais: parsePostgresArray(inst.areas_profissionais),
        };

        if (!acc[categoria]) acc[categoria] = [];
        acc[categoria].push(instrumentoConvertido);
        return acc;
      }, {});

  // console.log(instrumentosPorCategoria)
  return instrumentosPorCategoria
}

function parsePostgresArray(pgArray) {
  if (!pgArray) return [];
  return pgArray.replace(/^{|}$/g, "").split(",").map(s => s.trim());
}

export async function salvarHipotesesGeradas(idPaciente, hipoteses) {

  await supabase
    .from('hipoteses')
    .delete("*")
    .eq("id_paciente", idPaciente)

  for (const h of hipoteses) {
    const { data, error } = await supabase
        .from("hipoteses")
        .insert({
          id_paciente: idPaciente,
          id_hipotese: h.idHipotese,
          hipotese: h.hipotese,
          formas_avaliacao: h.formas_avaliacao,
          construtos: h.construtos,
          origem: h.origem,
        })
      }
    revalidatePath(`/pacientes/${idPaciente}`);
  }
  


export async function salvarHipotese(idPaciente, novaHipotese) {
  const { data, error } = await supabase
    .from("hipoteses")
    .insert({
      id_paciente: idPaciente,
      hipotese: novaHipotese.hipotese,
      formas_avaliacao: novaHipotese.formas_avaliacao,
      construtos: novaHipotese.construtos,
      origem: novaHipotese.origem,
    })
    .select() // retorna os dados inseridos
    .single(); // retorna um único registro

  if (error) {
    console.error("Erro ao salvar hipótese:", error);
    throw error;
  }

  // Converte campos JSON para array caso venha como string
  return {
    ...data,
    formas_avaliacao: data.formas_avaliacao || [],
    construtos: data.construtos || [],
  };
}

export async function excluirHipotese(idHipotese) {
  const { error } = await supabase
    .from("hipoteses")
    .delete()
    .eq("id", idHipotese) // usa o id do registro no banco

  if (error) {
    console.error("Erro ao excluir hipótese:", error)
    throw error
  }
}



export async function buscarSessoes(pacienteId) {
  const { data, error } = await supabase
    .from("sessoes")
    .select("*")
    .eq("id_paciente", pacienteId)
    .order("data", { ascending: true })

  if (error) {
    console.error("Erro ao buscar sessões:", error)
    return []
  }

  return data
}




// --- Sessões ---

export const getSessoes = async (pacienteId) => {
  const { data, error } = await supabase
    .from('sessoes')
    .select(`
      id,
      id_paciente,
      data,
      hora_inicio,
      hora_fim,
      valor,
      presenca,
      status_pagamento,
      observacoes,
      progresso,
      comportamento,
      recomendacoes,
      sessao_instrumentos(instrumento_id),
      sessao_hipoteses(hipotese_id)
    `)
    .eq('id_paciente', pacienteId)
    .order('data', { ascending: true });

  if (error) {
    console.error("Erro ao buscar sessões:", error);
    return [];
  }

  // Mapeia para camelCase e extrai ids de instrumentos e hipóteses
  return data.map(s => ({
    id: s.id,
    pacienteId: s.id_paciente, 
    data: s.data,
    hora_inicio: s.hora_inicio,
    hora_fim: s.hora_fim,
    valor: s.valor,
    presenca: s.presenca,
    status_pagamento: s.status_pagamento,
    observacoes: s.observacoes,
    progresso: s.progresso,
    comportamento: s.comportamento,
    recomendacoes: s.recomendacoes,
    instrumentos: s.sessao_instrumentos?.map(i => i.instrumento_id) || [],
    hipoteses: s.sessao_hipoteses?.map(h => h.hipotese_id) || []
  }));
};


export const criarSessao = async ({ pacienteId, form, instrumentos = [], hipoteses = [] }) => {
  const { data, error } = await supabase
    .from("sessoes")
    .insert([{
      id_paciente: pacienteId,
      data: form.data,
      hora_inicio: form.hora_inicio,
      hora_fim: form.hora_fim,
      valor: form.valor,
      presenca: "confirmado",
      status_pagamento: "a pagar",
      observacoes: form.observacoes || "",
      progresso: form.progresso || "",
      comportamento: form.comportamento || "",
      recomendacoes: form.recomendacoes || "",
    }])
    .select();

  if (error) throw error;

  const sessaoId = data[0].id;

  for (let inst of instrumentos) {
    await supabase.from("sessao_instrumentos").insert({ sessao_id: sessaoId, instrumento_id: inst });
  }

  for (let hip of hipoteses) {
    await supabase.from("sessao_hipoteses").insert({ sessao_id: sessaoId, hipotese_id: hip });
  }

  return { ...data[0], instrumentos, hipoteses };
};

export const atualizarSessaoBD = async ({ sessaoId, form, instrumentos = [], hipoteses = [] }) => {
  // Atualiza os campos da sessão
  const { error: erroAtualizacao } = await supabase
    .from("sessoes")
    .update({
      data: form.data,
      hora_inicio: form.hora_inicio,
      hora_fim: form.hora_fim,
      valor: form.valor,
      presenca: form.presenca || "confirmado",
      status_pagamento: form.status_pagamento || "a pagar",
      observacoes: form.observacoes || "",
      progresso: form.progresso || "",
      comportamento: form.comportamento || "",
      recomendacoes: form.recomendacoes || "",
    })
    .eq("id", sessaoId);

  if (erroAtualizacao) throw erroAtualizacao;

  // --- Instrumentos ---
  const { data: instrumentosAtuais } = await supabase
    .from("sessao_instrumentos")
    .select("instrumento_id")
    .eq("sessao_id", sessaoId);

  const atuaisIds = instrumentosAtuais.map(i => i.instrumento_id);

  // Inserir novos instrumentos
  for (let inst of instrumentos) {
    if (!atuaisIds.includes(inst)) {
      await supabase.from("sessao_instrumentos").insert({ sessao_id: sessaoId, instrumento_id: inst });
    }
  }

  // Remover instrumentos que não estão mais
  for (let inst of atuaisIds) {
    if (!instrumentos.includes(inst)) {
      await supabase.from("sessao_instrumentos")
        .delete()
        .eq("sessao_id", sessaoId)
        .eq("instrumento_id", inst);
    }
  }

  // --- Hipóteses ---
  const { data: hipotesesAtuais } = await supabase
    .from("sessao_hipoteses")
    .select("hipotese_id")
    .eq("sessao_id", sessaoId);

  const atuaisHipIds = hipotesesAtuais.map(h => h.hipotese_id);

  // Inserir novas hipóteses
  for (let hip of hipoteses) {
    if (!atuaisHipIds.includes(hip)) {
      await supabase.from("sessao_hipoteses").insert({ sessao_id: sessaoId, hipotese_id: hip });
    }
  }

  // Remover hipóteses que não estão mais
  for (let hip of atuaisHipIds) {
    if (!hipoteses.includes(hip)) {
      await supabase.from("sessao_hipoteses")
        .delete()
        .eq("sessao_id", sessaoId)
        .eq("hipotese_id", hip);
    }
  }

  return { id: sessaoId, ...form, instrumentos, hipoteses };
};


export const excluirSessao = async (sessaoId) => {
  await supabase.from("sessoes").delete().eq("id", sessaoId);
  await supabase.from("sessao_instrumentos").delete().eq("sessao_id", sessaoId);
  await supabase.from("sessao_hipoteses").delete().eq("sessao_id", sessaoId);
};



// Função para limpar nomes de arquivos
function sanitizeFileName(name) {
  return name
    .normalize("NFD")                  // separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/\s+/g, "_")             // espaços → underline
    .replace(/[^a-zA-Z0-9._-]/g, ""); // remove caracteres inválidos
}



// Buscar detalhes de um instrumento em uma sessão

// Função para buscar detalhes de um instrumento de uma sessão
export async function buscarDetalhesInstrumento(sessaoId, instrumentoId) {

  try {
    const { data, error } = await supabase
      .from("sessao_instrumentos")
      .select("*")
      .eq("sessao_id", sessaoId)
      .eq("instrumento_id", instrumentoId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    console.log(data)
    if (!data) return null;

    const arquivosIds = data.arquivo_url ? data.arquivo_url.split(",").map(id => Number(id)) : [];
    const audioIds = data.audio ? data.audio.split(",").map(id => Number(id)) : [];

    const arquivosData = arquivosIds.length > 0
      ? (await supabase.from("arquivos").select("*").in("id", arquivosIds)).data
      : [];
    const audiosData = audioIds.length > 0
      ? (await supabase.from("arquivos").select("*").in("id", audioIds)).data
      : [];

    const arquivosComUrl = arquivosData.map(f => ({ ...f, url: f.caminho_arquivo }));
    const audiosComUrl = audiosData.map(f => ({ ...f, url: f.caminho_arquivo }));
    console.log({ ...data, arquivos: arquivosComUrl, audios: audiosComUrl })
    return { ...data, arquivos: arquivosComUrl, audios: audiosComUrl };
  } catch (err) {
    console.error("Erro ao buscar detalhes do instrumento:", err);
    return null;
  }
}


// Salvar ou atualizar detalhes do instrumento
// Salvar ou atualizar detalhes do instrumento
export async function salvarDetalhesInstrumento(formData) {
  const sessaoId = formData.get("sessaoId");
  const instrumentoId = formData.get("instrumentoId");
  const pacienteId = formData.get("pacienteId");
  const instrumentoNome = formData.get("instrumentoNome");
  const conteudo = formData.get("conteudo");
  const arquivosList = formData.getAll("arquivos");

  if (!sessaoId || !instrumentoId || !pacienteId) {
    throw new Error("Sessão, instrumento ou paciente não informados");
  }

  try {
    // 1️⃣ Upload de arquivos (com observações)
    const arquivosUpload = await Promise.all(
      arquivosList.map(async (file, index) => {
        if (!file || !file.name || file.size === 0) return null;

        const observacao = formData.get(`observacoesNovos[${index}]`) || "";
        const tipo = formData.get(`tiposNovos[${index}]`) || 
          (file.type.startsWith("audio") ? "audio" : "file");

        const safeFileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
        const filePath = `arquivos/${safeFileName}`;

        // Salvar na tabela arquivos (com observação vinda do formData)
        const { data: arquivoData, error: arquivoError } = await supabase
          .from("arquivos")
          .insert({
            caminho_arquivo: filePath,
            titulo: instrumentoNome,
            comentario: observacao,
            tipo,
            id_paciente: pacienteId,
            nome_arquivo: file.name,
          })
          .select()
          .single();

        if (arquivoError) throw arquivoError;

        return {
          id: arquivoData.id,
          tipo: arquivoData.tipo,
          nome: arquivoData.nome_arquivo,
        };
      })
    );

    // 2️⃣ Atualizar observações de arquivos já existentes
    const arquivosExistentesRaw = formData.get("arquivosExistentes");
    if (arquivosExistentesRaw) {
      const arquivosExistentes = JSON.parse(arquivosExistentesRaw);
      for (const arq of arquivosExistentes) {
        await supabase
          .from("arquivos")
          .update({ comentario: arq.comentario })
          .eq("id", arq.id);
      }
    }

    // 3️⃣ Separar arquivos e áudios
    const arquivosIds = arquivosUpload.filter(f => f && f.tipo !== "audio").map(f => f.id);
    const audiosIds = arquivosUpload.filter(f => f && f.tipo === "audio").map(f => f.id);

    // 4️⃣ Atualizar ou inserir em sessao_instrumentos
    const { data: existingData, error: fetchError } = await supabase
      .from("sessao_instrumentos")
      .select("*")
      .eq("sessao_id", sessaoId)
      .eq("instrumento_id", instrumentoId);

    if (fetchError) throw fetchError;

    if (existingData.length > 0) {
      const registro = existingData[0];

      const novoArquivoIds = registro.arquivo_url
        ? [...registro.arquivo_url.split(",").map(id => Number(id)), ...arquivosIds]
        : arquivosIds;

      const novoAudioIds = registro.audio
        ? [...registro.audio.split(",").map(id => Number(id)), ...audiosIds]
        : audiosIds;

      const { data: updatedData, error: updateError } = await supabase
        .from("sessao_instrumentos")
        .update({
          resultado: conteudo,
          arquivo_url: novoArquivoIds.join(","),
          audio: novoAudioIds.join(","),
        })
        .eq("id", registro.id);

      if (updateError) throw updateError;
      return updatedData;
    }

    // 5️⃣ Inserir novo registro
    const { data: insertedData, error: insertError } = await supabase
      .from("sessao_instrumentos")
      .insert({
        sessao_id: sessaoId,
        instrumento_id: instrumentoId,
        resultado: conteudo,
        arquivo_url: arquivosIds.join(",") || null,
        audio: audiosIds.join(",") || null,
      });

    if (insertError) throw insertError;
    return insertedData;
  } catch (err) {
    console.error("Erro ao salvar instrumento:", err);
    throw err;
  }
}

// Deletar arquivo ou áudio existente
// Deletar arquivo e atualizar sessao_instrumentos
export async function deletarArquivoDaSessao(arquivoId, sessaoId, instrumentoId) {
  if (!arquivoId || !sessaoId || !instrumentoId) throw new Error("Parâmetros insuficientes");

  // 1️⃣ Buscar sessão
  const { data: sessaoData, error: fetchError } = await supabase
    .from("sessao_instrumentos")
    .select("*")
    .eq("sessao_id", sessaoId)
    .eq("instrumento_id", instrumentoId)
    .single();

  if (fetchError) throw fetchError;

  let arquivosIds = sessaoData.arquivo_url ? sessaoData.arquivo_url.split(",").map(id => Number(id)) : [];
  arquivosIds = arquivosIds.filter(id => id !== arquivoId);

  // 2️⃣ Atualizar coluna arquivo_url
  const { error: updateError } = await supabase
    .from("sessao_instrumentos")
    .update({ arquivo_url: arquivosIds.length ? arquivosIds.join(",") : null })
    .eq("id", sessaoData.id);

  if (updateError) throw updateError;

  // 3️⃣ Deletar da tabela arquivos (opcional)
  const { error: deleteError } = await supabase
    .from("arquivos")
    .delete()
    .eq("id", arquivoId);

  if (deleteError) throw deleteError;

  return true;
}


// Buscar dados de um instrumento e arquivos da sessão
export async function buscarSessaoInstrumento(sessaoId, instrumentoId) {
  try {
    const { data: sessaoInstrumento, error } = await supabase
      .from("sessao_instrumentos")
      .select("*")
      .eq("sessao_id", sessaoId)
      .eq("instrumento_id", instrumentoId)
      .single();
    if (error && error.code !== "PGRST116") throw error; // ignora "no rows found"

    let arquivos = [];
    if (sessaoInstrumento?.arquivo_url) {
      const ids = sessaoInstrumento.arquivo_url.split(",").map(id => parseInt(id));
      const { data: arquivosData, error: arquivosError } = await supabase
        .from("arquivos")
        .select("*")
        .in("id", ids);
      if (arquivosError) throw arquivosError;
      arquivos = arquivosData || [];
    }

    return { resultado: sessaoInstrumento?.resultado || "", sessao_arquivos: arquivos };

  } catch (err) {
    console.error("Erro ao buscar instrumento:", err);
    return { resultado: "", sessao_arquivos: [] };
  }
}




export async function salvarArquivoPaciente(formData, id_paciente) {
  const arquivo = formData.get("caminho_arquivo")
  const titulo = formData.get("titulo")
  const comentario = formData.get("comentario")

  if (!arquivo) {
    return { ok: false, error: "Nenhum arquivo enviado" }
  }

  // Nome único no Storage
  const safeFileName = `${Date.now()}_${sanitizeFileName(arquivo.name)}`
  const filePath = `arquivos/${id_paciente}/${safeFileName}`

  // 🔹 Upload para Storage
  const { error: storageError } = await supabase
    .storage
    .from("files")
    .upload(filePath, arquivo, { cacheControl: "3600", upsert: false })

  if (storageError) {
    return { ok: false, error: storageError.message || "Erro no upload para o storage" }
  }

  // 🔹 Pegar URL pública
  const { data: publicUrl } = supabase
    .storage
    .from("files")
    .getPublicUrl(filePath)

  // 🔹 Salvar metadados no BD
  const { data, error: dbError } = await supabase
    .from("arquivos")
    .insert([{
      id_paciente,
      nome_arquivo: arquivo.name,
      caminho_arquivo: publicUrl.publicUrl,
      titulo,
      comentario,
      tipo: arquivo.type
    }])
    .select()
    .single()

  if (dbError) {
    return { ok: false, error: dbError.message || "Erro ao salvar no banco" }
  }

  revalidatePath(`/pacientes/${id_paciente}/arquivos`);

  return { ok: true, data }
}


export async function getArquivosPaciente(pacienteId) {
  
  const { data, error } = await supabase
    .from("arquivos")
    .select("*")
    .eq("id_paciente", pacienteId)
    .order("created_at", { ascending: false }) // últimos primeiro

  if (error) {
    console.error("Erro ao buscar arquivos:", error)
    throw error
  }

  return data
}


export async function excluirArquivoPaciente(arquivo) {
  // 1. Deletar do Storage
  const caminho_relativo = arquivo.caminho_arquivo.split("/files/")[1]

  if (caminho_relativo) {
    const { error: storageError } = await supabase
      .storage
      .from("files")
      .remove([caminho_relativo]); // 'arquivos/{id_paciente}/{nome_arquivo}'
    
    if (storageError) throw storageError;
  }

  // 2. Deletar do banco
  const { error: dbError } = await supabase
    .from("arquivos")
    .delete()
    .eq("id", arquivo.id);

  if (dbError) throw dbError;

  return true;
}

export async function atualizarArquivoPaciente(id, formData) {
  const arquivo = formData.get("caminho_arquivo")
  const titulo = formData.get("titulo")
  const comentario = formData.get("comentario")

  let updatedData = { titulo, comentario }

  // Se tiver um novo arquivo, envia para Storage
  if (arquivo) {
    const safeFileName = `${Date.now()}_${sanitizeFileName(arquivo.name)}`
    const filePath = `arquivos/${arquivo.id_paciente}/${safeFileName}`

    const { error: storageError } = await supabase
      .storage
      .from("files")
      .upload(filePath, arquivo, { cacheControl: "3600", upsert: false })
    if (storageError) throw storageError

    const { data: publicUrl } = supabase
      .storage
      .from("files")
      .getPublicUrl(filePath)

    updatedData = {
      ...updatedData,
      nome_arquivo: arquivo.name,
      caminho_arquivo: publicUrl.publicUrl,
      tipo: arquivo.type
    }
  }

  // Atualiza no BD
  const { data, error: dbError } = await supabase
    .from("arquivos")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single()

  if (dbError) throw dbError

  return data
}


export async function getInstrumentosPaciente(pacienteId) {
  const { data, error } = await supabase
    .from('sessao_instrumentos')
    .select(`
      id,
      resultado,
      arquivo_url,
      instrumentos!inner(
        nome,
        descricao_completa
      ),
      sessoes!inner(
        id_paciente
      )
    `)
    .eq('sessoes.id_paciente', pacienteId);

  if (error) {
    console.log(data)
    console.error("Erro ao buscar instrumentos do paciente:", error);
    throw error;
  }

  // Retorna apenas um array de objetos com nome e descrição
  return data.map(item => ({
    id: item.id,
    nome: item.instrumentos.nome,
    descricao_completa: item.instrumentos.descricao_completa,
    resultado: item.resultado,
    arquivo_url: item.arquivo_url,
  }));
}

export async function getTodosInstrumentos() {
  const { data, error } = await supabase
    .from('instrumentos')
    .select('id, nome, descricao_completa, descricao')

  if (error) {
    console.error("Erro ao buscar instrumentos do banco:", error)
    return []
  }

  return data || []
}


// export async function salvarRelatorio(idPaciente, secoes) {
//   try {
//     for (const secao of secoes) {
//       const conteudo = secao.conteudo?.trim() || ''

//       // Se não tiver conteúdo, não salva
//       if (!conteudo) continue

//       // Verifica se já existe registro para este paciente e sessão
//       const { data: existente, error } = await supabase
//         .from('relatorio_avaliacao')
//         .select('*')
//         .eq('id_paciente', idPaciente)
//         .eq('sessao', secao.titulo)
//         .single()

//       if (error && error.code !== 'PGRST116') {
//         console.error('Erro ao verificar relatório existente:', error)
//         continue
//       }

//       if (existente) {
//         // Atualiza se o conteúdo mudou
//         if (existente.conteudo !== conteudo) {
//           await supabase
//             .from('relatorio_avaliacao')
//             .update({ conteudo })
//             .eq('id', existente.id)
//         }
//       } else {
//         // Insere nova linha
//         await supabase
//           .from('relatorio_avaliacao')
//           .insert({
//             id_paciente: idPaciente,
//             sessao: secao.titulo,
//             conteudo
//           })
//       }
//     }

//     return true
//   } catch (err) {
//     console.error('Erro inesperado ao salvar relatório:', err)
//     return false
//   }
// }

// Função para buscar relatório salvo
export async function buscarRelatorio(idPaciente) {
  try {
    const { data, error } = await supabase
      .from('relatorio_avaliacao')
      .select('*')
      .eq('id_paciente', idPaciente)

    if (error) {
      console.error('Erro ao buscar relatório:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Erro inesperado ao buscar relatório:', err)
    return []
  }
}


export async function salvarRelatorio(idPaciente, secoes, instrumentos = []) {
  try {
    // 1️⃣ Salva as seções
    for (const sec of secoes) {
      if (!sec.conteudo || sec.conteudo.trim() === "") continue; // ignora se vazio

      const { data: existente, error: errorSelect } = await supabase
        .from("relatorio_avaliacao")
        .select("*")
        .eq("id_paciente", idPaciente)
        .eq("sessao", sec.titulo)
        .single();

      if (errorSelect && errorSelect.code !== "PGRST116") {
        console.error("Erro ao buscar seção existente:", errorSelect);
        continue;
      }

      if (existente) {
        await supabase
          .from("relatorio_avaliacao")
          .update({ conteudo: sec.conteudo })
          .eq("id_paciente", idPaciente)
          .eq("sessao", sec.titulo);
      } else {
        await supabase
          .from("relatorio_avaliacao")
          .insert({ id_paciente: idPaciente, sessao: sec.titulo, conteudo: sec.conteudo });
      }
    }

    // 2️⃣ Salva cada instrumento como uma "sessão" separada
    for (const inst of instrumentos) {
      if (!inst.resultado || inst.resultado.trim() === "") continue; // ignora se vazio

      const tituloInst = `Instrumento - ${inst.nome}`;

      const { data: existenteInst, error: errorInst } = await supabase
        .from("relatorio_avaliacao")
        .select("*")
        .eq("id_paciente", idPaciente)
        .eq("sessao", tituloInst)
        .single();

      if (errorInst && errorInst.code !== "PGRST116") {
        console.error("Erro ao buscar instrumento existente:", errorInst);
        continue;
      }

      if (existenteInst) {
        await supabase
          .from("relatorio_avaliacao")
          .update({ conteudo: inst.resultado })
          .eq("id_paciente", idPaciente)
          .eq("sessao", tituloInst);
      } else {
        await supabase
          .from("relatorio_avaliacao")
          .insert({ id_paciente: idPaciente, sessao: tituloInst, conteudo: inst.resultado });
      }
    }

    return true;
  } catch (e) {
    console.error("Erro ao salvar relatório:", e);
    return false;
  }
}


export async function removerInstrumentoRelatorio(idPaciente, nomeInstrumento) {
  try {
    const { error } = await supabase
      .from("relatorio_avaliacao")
      .delete()
      .eq("id_paciente", idPaciente)
      .eq("sessao", `Instrumento - ${nomeInstrumento}`)

    if (error) throw error
    return true
  } catch (err) {
    console.error("Erro ao remover instrumento:", err.message)
    return false
  }
}


// // Buscar detalhes do instrumento e arquivos de uma sessão
// export async function buscarDetalhesInstrumento(sessaoId, instrumentoId) {
//   if (!sessaoId || !instrumentoId) return null;

//   try {
//     // 1️⃣ Buscar dados da tabela sessao_instrumentos
//     const { data: sessaoInstrumento, error } = await supabase
//       .from("sessao_instrumentos")
//       .select(`
//         resultado,
//         arquivo_url,
//         audio
//       `)
//       .eq("sessao_id", sessaoId)
//       .eq("instrumento_id", instrumentoId)
//       .single();

//     if (error && error.code !== "PGRST116") throw error; // PGRST116 = registro não encontrado

//     if (!sessaoInstrumento) return null;

//     // 2️⃣ Preparar arquivos
//     const arquivosExistentes = [];

//     // arquivos do tipo "file"
//     if (sessaoInstrumento.arquivo_url) {
//       const arquivosArray = sessaoInstrumento.arquivo_url.split(", "); // separa múltiplos
//       arquivosArray.forEach(url => {
//         arquivosExistentes.push({
//           url,
//           type: "file",
//           observacao: "", // pode buscar comentário na tabela arquivos depois
//           file: null
//         });
//       });
//     }

//     // arquivos do tipo "audio"
//     if (sessaoInstrumento.audio) {
//       const audioArray = sessaoInstrumento.audio.split(", ");
//       audioArray.forEach(url => {
//         arquivosExistentes.push({
//           url,
//           type: "audio",
//           observacao: "",
//           file: null
//         });
//       });
//     }

//     return {
//       resultado: sessaoInstrumento.resultado,
//       arquivos: arquivosExistentes
//     };

//   } catch (error) {
//     console.error("Erro ao buscar detalhes do instrumento:", error);
//     return null;
//   }
// }



// export async function salvarDetalhesInstrumento(formData) {
//   try {
//     const sessaoId = formData.get("sessaoId");
//     const instrumentoId = formData.get("instrumentoId");
//     const resultado = formData.get("conteudo") || "";

//     // Separar arquivos e áudios
//     const arquivos = [];
//     const audios = [];

//     for (let [key, value] of formData.entries()) {
//       if (key === "arquivos" && value instanceof File) {
//         // Upload do arquivo no Supabase Storage
//         const { data, error } = await supabase.storage
//           .from("sessao_instrumentos") // pasta/bucket
//           .upload(`arquivos/${Date.now()}_${value.name}`, value, { cacheControl: "3600", upsert: true });
//         if (error) throw error;
//         const url = supabase.storage.from("sessao_instrumentos").getPublicUrl(data.path).publicUrl;
//         arquivos.push(url);
//       } else if (key.startsWith("tipo_") && value === "audio") {
//         const index = key.split("_")[1];
//         const audioFile = formData.get(`arquivos`);
//         if (audioFile) {
//           const { data, error } = await supabase.storage
//             .from("sessao_instrumentos")
//             .upload(`audios/${Date.now()}_${audioFile.name}`, audioFile, { cacheControl: "3600", upsert: true });
//           if (error) throw error;
//           const url = supabase.storage.from("sessao_instrumentos").getPublicUrl(data.path).publicUrl;
//           audios.push(url);
//         }
//       }
//     }

//     // Inserir no Supabase
//     const { data, error } = await supabase
//       .from("sessao_instrumentos")
//       .insert([{
//         sessao_id: sessaoId,
//         instrumento_id: instrumentoId,
//         resultado,
//         arquivo_url: arquivos.length > 0 ? JSON.stringify(arquivos) : null,
//         audio: audios.length > 0 ? JSON.stringify(audios) : null
//       }]);

//     if (error) throw error;

//     return data;
//   } catch (error) {
//     console.error("Erro ao salvar instrumento no Supabase:", error);
//     throw error;
//   }
// }
