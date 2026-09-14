# Trustless Work — Testnet Laboratory

## ¿Qué es?

**Trustless Work Laboratory** (también conocido como **Escrow Lab**) es una dApp de demostración en **testnet** de Stellar. Su propósito no es ser un producto final para usuarios de negocio, sino un **laboratorio práctico** para desarrolladores que quieren entender, probar e integrar la infraestructura de escrows de [Trustless Work](https://docs.trustlesswork.com/trustless-work).

En otras palabras: es un entorno vivo donde puedes ver cómo se conecta una aplicación React/Next.js con la API de Trustless Work, firmar transacciones on-chain y explorar el ciclo de vida de un escrow sin tener que montar todo desde cero.

---

## Propósito

Trustless Work ofrece una capa de **escrows programables** sobre Stellar/Soroban: fondos retenidos de forma transparente hasta que se cumplen condiciones acordadas (por ejemplo, hitos, aprobaciones o resolución de disputas).

Este laboratorio existe para:

- **Demostrar** la integración real con la API de Trustless Work.
- **Acelerar onboarding** de builders que quieren copiar patrones listos (wallet, forms, providers, llamadas HTTP).
- **Experimentar en testnet** sin riesgo de mainnet: conectar wallet, desplegar escrows, consultar datos y observar respuestas.
- **Servir de referencia visual** de cómo se organiza una UI alrededor de tipos de escrow, helpers e indexación.

No está pensada como backoffice de producción ni como marketplace. Es un **sandbox educativo y técnico**.

---

## ¿Para quién es?

| Audiencia                          | Qué obtiene                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| Desarrolladores frontend           | Ejemplo concreto de integración con wallet Stellar + API REST + formularios tipados |
| Equipos que evalúan Trustless Work | Forma rápida de “tocar” el flujo end-to-end en testnet                              |
| Contributors / OSS                 | Base para explorar integraciones de los escrows                                     |

---

## Qué hace la app (a alto nivel)

La interfaz se organiza en módulos orientados a **capacidades**, no a un flujo de negocio cerrado:

1. **Conexión de wallet**  
   Autenticación on-chain vía Stellar Wallets Kit (p. ej. Freighter) en red de prueba. Sin wallet conectada, las operaciones quedan bloqueadas.

2. **Selección de modelo de escrow**  
   Permite trabajar con dos paradigmas de diseño:
   - **Single Release** — un pago / liberación más simple.
   - **Multi Release** — lógica orientada a múltiples hitos o liberaciones.

3. **Deploy**  
   Inicialización y despliegue de contratos de escrow en Stellar a través de la API de Trustless Work.

4. **Gestión de escrows**  
   Área donde se interactúa con un escrow ya existente o recién creado (cargar por contrato, actualizar contexto, operar sobre su estado)

5. **Helpers**  
   Utilidades de soporte para interacciones on-chain auxiliares (por ejemplo, consultar balances de varios escrows).

6. **Indexer**  
   Consultas orientadas a datos indexados: buscar escrows por firmante, por rol o por IDs de contrato. Sirve para entender cómo recuperar y listar información sin depender solo del estado local de la UI.

7. **Visualización de respuestas**  
   Muestra resultados de las llamadas (éxito / error) para depurar y aprender el contrato de la API.

8. **Experiencia de laboratorio**  
   Tema claro/oscuro, layout tipo dashboard técnico, y componentes listos para reutilizar o adaptar en otra dApp.

---

## Stack y piezas clave

- **Next.js (App Router)** + React + TypeScript
- **@trustless-work/escrow** — SDK / cliente hacia la API de escrows
- **Stellar Wallets Kit** — conexión y firma de transacciones
- **TanStack Query** — fetching y mutaciones
- **React Hook Form + Zod** — formularios y validación
- **ShadCN / Radix + Tailwind** — UI
- **Axios** — HTTP hacia la API de Trustless Work

La app corre contra **testnet** y requiere una **API key** de Trustless Work (`NEXT_PUBLIC_API_KEY`).

---

## Qué _no_ es

- No es un producto de pagos para el usuario final.
- No es la documentación oficial (eso vive en [docs.trustlesswork.com](https://docs.trustlesswork.com/trustless-work)).
- No sustituye al SDK ni a los bloques: los **ilustra** en un entorno runnable.
- No está enfocada en mainnet ni en compliance de producción.

---

## En una frase

> Un laboratorio en testnet para que builders vean, prueben y copien cómo integrar escrows de Trustless Work en una dApp React sobre Stellar.

---

## Enlaces útiles

- [Documentación Trustless Work](https://docs.trustlesswork.com/trustless-work)
- [Escrow Lab (docs OSS)](https://docs.trustlesswork.com/trustless-work/oss-dapps/escrow-lab)
- [README del proyecto](./README.md) — setup, variables de entorno y wallets
