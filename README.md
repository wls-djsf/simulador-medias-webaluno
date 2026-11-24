# 🎓 WebAluno | Simulador de Médias e Aprovação (UniÍtalo)

Simulador visual, interativo e passo a passo criado para facilitar a vida dos estudantes universitários na hora de calcular e simular a **Média Final (MF)** nas modalidades **Presencial** e **On-Line (EAD)**.

Desenvolvido aplicando princípios de **IHC (Interação Humano-Computador)** e **UX (Experiência do Usuário)**, com a identidade visual do portal **WebAluno**.

---

## 🧮 Fórmulas Oficiais Suportadas

### 1. Modalidade Presencial
$$\text{Média Final (MF)} = \frac{(\text{NT} \times 2) + (\text{AP} \times 2) + (\text{AF} \times 3) + (\text{AI} \times 3)}{10}$$

- **NT (Peso 2 — 20%):** Nota TEAS (vale até `2,0` pontos na média)
- **AP (Peso 2 — 20%):** Avaliação Professor (vale até `2,0` pontos na média)
- **AF (Peso 3 — 30%):** Avaliação Final (vale até `3,0` pontos na média)
- **AI (Peso 3 — 30%):** Avaliação Integrada (vale até `3,0` pontos na média)
- **Critério de aprovação:** Média Final $\ge 6,0$ e Frequência Mínima de $75\%$ nas aulas.

### 2. Modalidade On-Line (EAD)
$$\text{Média Final (MF)} = \frac{(\text{NT} \times 3) + (\text{FD} \times 1) + (\text{AF} \times 6)}{10}$$

- **NT (Peso 3 — 30%):** Nota TEAS (vale até `3,0` pontos na média)
- **FD (Peso 1 — 10%):** Fórum de Discussão (vale até `1,0` ponto na média)
- **AF (Peso 6 — 60%):** Avaliação Final (vale até `6,0` pontos na média)
- **Critério de aprovação:** Média Final $\ge 6,0$.

---

## ✨ Funcionalidades de Usabilidade (IHC & UX)

- **Substituição Visual Passo a Passo:** Mostra a fórmula oficial com as notas do aluno substituídas no lugar das siglas, a multiplicação pelos pesos e a divisão final por 10.
- **Modo "Ainda não tenho / Quanto preciso tirar?":** Basta marcar qualquer avaliação como pendente para descobrir exatamente qual nota (de `0` a `10`) você precisa tirar para fechar com média `6,0`.
- **Decomposição em Fatias de Pontos:** Exibe quantos pontos diretos na média cada nota já garantiu.
- **Calculadora de Frequência Dupla (75%):** Simule direto pela porcentagem `%` ou informando o total de aulas e número de faltas.
