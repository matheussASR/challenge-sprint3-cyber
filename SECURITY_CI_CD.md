# Pipeline CI/CD de Segurança (SAST, SCA, DAST)

## Visão geral
Este repositório executa testes de segurança contínuos:
- **SAST (Semgrep)**: análise estática de código no CI.
- **SCA (OWASP Dependency-Check)**: análise de dependências e licenças.
- **DAST (OWASP ZAP)**: varredura dinâmica da aplicação em staging (local/URL).

Os scans rodam em **push/PR na main/master** e também via **Run workflow**.

## Políticas (gates)
- **SAST**: falha com achados **High/Critical**.
- **SCA**: falha se houver CVEs com **CVSS ≥ 7.0**.
- **DAST**: falha com achados **High/Critical**.
- Branch Protection recomenda bloquear merge sem todos os checks verdes.

## Onde ver os resultados
- **SAST**: GitHub → **Security → Code scanning alerts** (SARIF Semgrep).
- **SCA**: Artifact `sca-dependency-check-*/dependency-check-report.html`.
- **DAST**: Artifact `zap-dast-report/report_html.html`.
- Logs completos em **Actions → execução do workflow**.

## Como rodar
- GitHub → **Actions → CI/CD + Security (SAST, SCA, DAST) → Run workflow**.
- Ou faça um commit/push na branch protegida.

## Plano de ação
1. **Críticas (CVSS ≥ 9.0)**: corrigir em **até 72h**.
2. **Altas (7.0–8.9)**: corrigir em **até 7 dias**.
3. **Médias (4.0–6.9)**: priorizar na sprint seguinte.
4. **Licenças incompatíveis**: bloquear merge até substituir/regularizar.
5. **Supressões**: somente com justificativa e prazo.

## Notificações
Se configurado `SLACK_WEBHOOK_URL`, o pipeline envia status para o canal do time.

## Observações
- Para DAST local, a aplicação precisa ouvir em `http://127.0.0.1:3000`.  
  No `docker-compose.yml`, exponha:
  ```yaml
  ports:
    - "3000:3000"
