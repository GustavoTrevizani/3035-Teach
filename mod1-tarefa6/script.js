let tarefas = [];

const nomeTarefaInput = document.getElementById('nomeTarefa');
const adicionarBtn = document.getElementById('adicionarBtn');
const tarefasPendentes = document.getElementById('tarefasPendentes');
const tarefasConcluidas = document.getElementById('tarefasConcluidas');
const contadorPendentes = document.getElementById('contadorPendentes');
const contadorConcluidas = document.getElementById('contadorConcluidas');

adicionarBtn.addEventListener('click', () => {
    const nome = nomeTarefaInput.value.trim();
    if (nome !== "") {
        const tarefa = {
            nome: nome,
            dataCriacao: new Date().toLocaleString(),
            concluida: false
        };
        tarefas.push(tarefa);
        nomeTarefaInput.value = '';
        renderizarTarefas();
    }
});

function concluirTarefa(index) {
    tarefas[index].concluida = !tarefas[index].concluida;
    renderizarTarefas();
}

function renderizarTarefas() {
    tarefasPendentes.innerHTML = '';
    tarefasConcluidas.innerHTML = '';

    let countPendentes = 0;
    let countConcluidas = 0;

    tarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${tarefa.nome} <small>(${tarefa.dataCriacao})</small></span>
            <button onclick="concluirTarefa(${index})">
                ${tarefa.concluida ? 'Desmarcar' : 'Concluir'}
            </button>
        `;

        if (tarefa.concluida) {
            li.classList.add('concluida');
            tarefasConcluidas.appendChild(li);
            countConcluidas++;
        } else {
            tarefasPendentes.appendChild(li);
            countPendentes++;
        }
    });

    contadorPendentes.textContent = countPendentes;
    contadorConcluidas.textContent = countConcluidas;
}
