# **PACIFIC TACTICS**

## **DOCUMENTO DE DISEÑO DEL JUEGO (GDD)**


**Versión:** 2.0 (Actualizada \- Implementación Real)  
**Fecha:** Diciembre 2025  
**Equipo:** PVLI Grupo 11 \- Deep Code Studio  
**Estado:** Implementado y Jugable

[**1\. RESUMEN**](#1.-resumen)

[1.1 Concepto General](#1.1-concepto-general)

[1.2 Características Principales](#1.2-características-principales)

[1.3 Especificaciones Rápidas](#1.3-especificaciones-rápidas)

[**2\. CONCEPTO DEL JUEGO**](#2.-concepto-del-juego)

[2.1 Descripción General](#2.1-descripción-general)

[2.2 Género](#2.2-género)

[2.3 Pilares de Diseño](#2.3-pilares-de-diseño)

[2.4 Experiencia de Juego Deseada](#2.4-experiencia-de-juego-deseada)

[**3\. NARRATIVA Y CONTEXTO**](#3.-narrativa-y-contexto)

[3.1 Ambientación](#3.1-ambientación)

[3.2 Premisa](#3.2-premisa)

[3.3 Tono](#3.3-tono)

[**4\. GAMEPLAY CORE**](#4.-gameplay-core)

[4.1 Requisitos del Sistema](#4.1-requisitos-del-sistema)

[4.2 Estructura del Core Loop](#4.2-estructura-del-core-loop)

[4.3 Progresión Detallada de un Turno](#4.3-progresión-detallada-de-un-turno)

[**5\. MECÁNICAS DEL JUEGO**](#5.-mecánicas-del-juego)

[5.1 El Tablero de Juego](#5.1-el-tablero-de-juego)

[5.1.1 Estructura](#5.1.1-estructura)

[5.1.2 Elementos en el Mapa](#5.1.2-elementos-en-el-mapa)

[5.2 Sistema de Orientación](#5.2-sistema-de-orientación)

[5.3 Sistema de Movimiento](#5.3-sistema-de-movimiento)

[5.4 Sistema de Combate](#5.4-sistema-de-combate)

[5.4.1 Disparo Normal (Cañones)](#5.4.1-disparo-normal-\(cañones\))

[5.4 Sistema de Vida](#5.4-sistema-de-vida)

[5.5 Sistema de Recursos](#5.5-sistema-de-recursos)

[**6\. SISTEMAS DEL JUEGO**](#6.-sistemas-del-juego)

[6.1 Sistema de Turnos](#6.1-sistema-de-turnos)

[6.2 Sistema de Eventos](#6.2-sistema-de-eventos)

[6.3 Sistema de Visibilidad](#6.3-sistema-de-visibilidad)

[6.4 Sistema de Zonas de Salida](#6.4-sistema-de-zonas-de-salida)

[6.5 Sistema de Cierre de Zona](#6.5-sistema-de-cierre-de-zona)

[**7\. INTERFAZ DE USUARIO**](#7.-interfaz-de-usuario)

[7.1 Sistema de Pantalla por Turnos](#7.1-sistema-de-pantalla-por-turnos)

[7.2 HUD (Head-Up Display)](#7.2-hud-\(head-up-display\))

[7.3 Vista del Submarino](#7.3-vista-del-submarino)

[7.4 Mapa Completo](#7.4-mapa-completo)

[7.5 Sistema de Anotaciones del Mapa](#7.5-sistema-de-anotaciones-del-mapa)

[7.6 Elementos Adicionales](#7.6-elementos-adicionales)

[**8\. MINIJUEGOS**](#8.-minijuegos)

[8.1 Minijuego del Dragón Vegano (Flappy Bird)](#8.1-minijuego-del-dragón-vegano-\(flappy-bird\))

[8.2 Minijuego de Reparación](#8.2-minijuego-de-reparación)

[**9\. CONDICIONES DE VICTORIA**](#9.-condiciones-de-victoria)

[9.1 Victoria por Eliminación](#9.1-victoria-por-eliminación)

[9.2 Victoria por Escape](#9.2-victoria-por-escape)

[9.3 Victoria por Rendición](#9.3-victoria-por-rendición)

[9.4 Pantalla de Victoria](#9.4-pantalla-de-victoria)

[**10\. ARQUITECTURA TÉCNICA**](#10.-arquitectura-técnica)

[10.1 Tecnologías](#10.1-tecnologías)

[10.2 Estructura General](#10.2-estructura-general)

[10.3 Configuración](#10.3-configuración)

[10.4 Valores Balanceados](#10.4-valores-balanceados)

[10.5 Rendimiento](#10.5-rendimiento)

[**11\. CARACTERÍSTICAS ADICIONALES IMPLEMENTADAS**](#11.-características-adicionales-implementadas)

[11.1 Sistema de Estadísticas de Partida](#11.1-sistema-de-estadísticas-de-partida)

[11.2 Sistema de Revancha](#11.2-sistema-de-revancha)

[**12\. CARACTERÍSTICAS NO IMPLEMENTADAS**](#12.-características-no-implementadas)

[12.1 Mecánicas de Combate No Completadas](#12.1-mecánicas-de-combate-no-completadas)

[12.2 Sistema de Mapa Anotable Completo](#12.2-sistema-de-mapa-anotable-completo)

[12.3 Minijuegos No Implementados](#12.3-minijuegos-no-implementados)

[12.4 Elementos del Mapa](#12.4-elementos-del-mapa)

[12.5 Mecánicas de Colocación](#12.5-mecánicas-de-colocación)

[12.6 Sistema de Recolección](#12.6-sistema-de-recolección)

[12.7 Visibilidad y Detección](#12.7-visibilidad-y-detección)

[12.8 Guardado y Persistencia](#12.8-guardado-y-persistencia)

[12.9 Contenido Adicional](#12.9-contenido-adicional)

[CONCLUSIÓN](#conclusión)

# 


# **1\. RESUMEN** <a id="1.-resumen"></a>

## **1.1 Concepto General** <a id="1.1-concepto-general"></a>

**Pacific Tactics** es un juego de estrategia por turnos para 2 jugadores donde cada uno controla un submarino en un tablero de 5x5 casillas. Los jugadores deben localizar y destruir el submarino enemigo o alcanzar su zona de escape, todo mientras gestionan recursos limitados y navegan con información visual restringida.

## **1.2 Características Principales** <a id="1.2-características-principales"></a>

* **Información Asimétrica:** Visión limitada a 3 direcciones (frontal y laterales)  
* **Sistema de Turnos Alternados:** Cada jugador juega su turno por separado  
* **Combate Táctico:** Dos tipos de munición y ataques aéreos estratégicos  
* **Gestión de Recursos:** 4 tipos de recursos para potenciar habilidades  
* **Múltiples Caminos a la Victoria:** Destrucción o escape  
* **Minijuegos Integrados:** 2 minijuegos completos con físicas  
* **NPC Dragón:** Elemento neutral que otorga recompensas

## **1.3 Especificaciones Rápidas** <a id="1.3-especificaciones-rápidas"></a>

| Aspecto | Especificación |
| ----- | ----- |
| **Jugadores** | 2 (local, pantalla compartida alternada) |
| **Duración Partida** | 10-20 minutos |
| **Tamaño Tablero** | 5x5 casillas (9x9 vértices) |
| **Plataforma** | Navegador web (Phaser 3\) |
| **Género** | Estrategia por turnos, táctica |
| **Público** | 12+ años |

# 

# **2\. CONCEPTO DEL JUEGO** <a id="2.-concepto-del-juego"></a>

## **2.1 Descripción General** <a id="2.1-descripción-general"></a>

Dos submarinos enemigos se enfrentan en aguas profundas. Ninguno conoce la posición exacta del otro. Los jugadores deben usar su visión limitada, deducción lógica y recursos estratégicos para localizar y eliminar al enemigo, o alternativamente, alcanzar su zona de escape para ganar por huida.

El juego combina elementos de:

* **Deducción:** Inferir la posición enemiga mediante pistas visuales  
* **Táctica:** Gestionar recursos y elegir momentos para atacar  
* **Estrategia:** Planificar rutas y decidir entre agresión o huida  
* **Habilidad:** Completar minijuegos para obtener ventajas

## **2.2 Género** <a id="2.2-género"></a>

**Género Principal:** Estrategia por turnos  
 **Subgéneros:**

* Táctica naval  
* Información asimétrica  
* Gestión de recursos  
* Deducción espacial

## **2.3 Pilares de Diseño** <a id="2.3-pilares-de-diseño"></a>

#### **1\. Visión Limitada** <a id="1.-visión-limitada"></a>

Los jugadores solo ven tres direcciones: frontal, lateral izquierda y lateral derecha. **Nunca ven su espalda** ni tienen vista cenital durante el turno de acción. Esta limitación crea tensión constante y obliga a la planificación cuidadosa.

#### **2\. Información Asimétrica** <a id="2.-información-asimétrica"></a>

Cada jugador conoce únicamente:

* Su propia posición y orientación  
* Su vida, munición y recursos  
* Lo que puede ver directamente  
* Sus propias anotaciones en el mapa

Debe deducir:

* Posición del enemigo  
* Estado del enemigo  
* Intenciones del enemigo

#### **3\. Deducción y Engaño** <a id="3.-deducción-y-engaño"></a>

El corazón del juego está en:

* Inferir ubicación enemiga mediante ataques aéreos  
* Crear patrones de movimiento impredecibles  
* Marcar posiciones sospechosas en el mapa  
* Anticipar movimientos del oponente

#### **4\. Múltiples Caminos a la Victoria** <a id="4.-múltiples-caminos-a-la-victoria"></a>

Los jugadores pueden:

* **Destruir:** Reducir HP enemigo a 0  
* **Escapar:** Alcanzar su zona de salida  
* **Forzar error:** Provocar que el enemigo se quede sin recursos

#### **5\. Rejugabilidad** <a id="5.-rejugabilidad"></a>

La información oculta, posiciones iniciales y aparición aleatoria de recursos hacen cada partida única.

## **2.4 Experiencia de Juego Deseada** <a id="2.4-experiencia-de-juego-deseada"></a>

Los jugadores deben sentir:

* **Tensión constante:** No saber dónde está el enemigo  
* **Satisfacción intelectual:** Deducir correctamente posiciones  
* **Momentos dramáticos:** Encuentros cara a cara inesperados  
* **Dilemas tácticos:** ¿Atacar o huir? ¿Gastar recursos o guardarlos?  
* **Control sobre el destino:** Las decisiones importan

# **3\. NARRATIVA Y CONTEXTO** <a id="3.-narrativa-y-contexto"></a>

## **3.1 Ambientación** <a id="3.1-ambientación"></a>

**Contexto Histórico:** Guerra naval submarina de mediados del siglo XX  
 **Facciones:**

* **Japón** (Submarino Azul)  
* **China** (Submarino Rojo)

## **3.2 Premisa** <a id="3.2-premisa"></a>

Eres el comandante de un submarino en una misión crítica. Las aguas están oscuras y la visibilidad es limitada. Tu sonar detectó presencia enemiga en el área, pero no conoces su ubicación exacta. Tu misión: destruir al enemigo o alcanzar la zona de extracción con vida.

## **3.3 Tono** <a id="3.3-tono"></a>

* Tenso y estratégico  
* Realista en limitaciones (sin vista omnisciente)  
* Accesible y dinámico  
* Con toques de fantasía (dragón vegano)

# **4\. GAMEPLAY CORE** <a id="4.-gameplay-core"></a>

## **4.1 Requisitos del Sistema** <a id="4.1-requisitos-del-sistema"></a>

**Requisitos Mínimos:**

* 2 jugadores físicamente presentes  
* 1 ordenador con navegador web moderno  
* Pantalla compartida (mínimo 800x600)  
* Ratón y teclado

**Navegadores Compatibles:**

* Chrome 90+  
* Firefox 88+  
* Edge 90+  
* Safari 14+

## **4.2 Estructura del Core Loop** <a id="4.2-estructura-del-core-loop"></a>

**INICIO DE PARTIDA**  
    **↓**  
**COLOCACIÓN INICIAL (posiciones fijas)**  
    **↓**  
**┌─────────────────────────────────┐**  
**│   LOOP PRINCIPAL DE RONDA                                    │**  
**├─────────────────────────────────┤**  
**│                                                                                                  │**  
**│  TURNO JUGADOR 1 (CHINA)                                      │**  
**│  ├─ Fase 1: Consulta de Mapa                                      │**  
**│  ├─ Fase 2: Movimiento                                                 │**  
**│  ├─ Fase 3: Acción (Ataque)                                          │**  
**│  └─ Fase 4: Fin de Turno                                               │**  
**│                                                                                                  │**  
**│  TURNO JUGADOR 2 (JAPÓN)                                    │**  
**│  ├─ Fase 1: Consulta de Mapa                                    │**  
**│  ├─ Fase 2: Movimiento                                               │**  
**│  ├─ Fase 3: Acción (Ataque)                                        │**  
**│  └─ Fase 4: Fin de Turno                                             │**  
**│                                                                                                │**  
**│  RESOLUCIÓN DE EFECTOS                                      │**  
**│  └─ Ataques aéreos, recursos                                    │**  
**│                                                                                               │**  
**└────────────────────────────────┘**  
    **↓**  
**¿CONDICIÓN DE VICTORIA?**  
    **├─ SÍ → FIN DE PARTIDA**

    **└─ NO → NUEVA RONDA**

## **4.3 Progresión Detallada de un Turno** <a id="4.3-progresión-detallada-de-un-turno"></a>

#### **FASE 1: Consulta de Información** <a id="fase-1:-consulta-de-información"></a>

El jugador puede:

* **Consultar el mapa completo** presionando tecla M  
  * Muestra el tablero completo sin niebla de guerra  
  * Visibles: bordes, zonas de salida, dragón, anotaciones propias  
  * NO visible: posición del enemigo  
* **Ver su HUD** con información propia  
  * Vida actual (HP/MaxHP)  
  * Munición disponible (Tipo 1 y Tipo 2\)  
  * Cooldown de ataque aéreo  
  * Inventario de recursos  
* **Vista del submarino** (3 ventanas)  
  * Frontal, lateral izquierda, lateral derecha  
  * Alcance de visión: 2-3 casillas

#### **FASE 2: Movimiento (Obligatorio Decidir)** <a id="fase-2:-movimiento-(obligatorio-decidir)"></a>

El jugador DEBE elegir una de estas opciones:

1. **Movimiento Frontal**   
   * Avanza 1 casilla hacia adelante  
   * Mantiene su orientación actual  
   * Tecla: **↑** o **W**  
2. **Movimiento Lateral Izquierdo**   
   * Avanza 1 casilla a la izquierda  
   * Rota 90° a la izquierda  
   * Tecla: **←** o **A**  
3. **Movimiento Lateral Derecho**   
   * Avanza 1 casilla a la derecha  
   * Rota 90° a la derecha  
   * Tecla: **→** o **D**  
4. **Permanecer Quieto**  
   * No se mueve ni cambia orientación  
   * Mantiene posición actual  
   * Tecla: **↓** o **S**

**Importante:**

* **No existe movimiento hacia atrás**  
* **El submarino siempre mira hacia adelante**  
* **Colisión con bordes:** No puedes moverte fuera del tablero  
* R**ecolección automática:** Si pasas por un recurso, lo recoges

#### **FASE 3: Acción (Opcional)** <a id="fase-3:-acción-(opcional)"></a>

Después de moverse, el jugador puede:

**Opción A: Disparo Normal (Cañones)** 

* Requiere: Munición disponible  
* Tipos disponibles:  
  * **Munición Tipo 1:** Alcance 1 casilla (15 balas iniciales)  
  * **Munición Tipo 2:** Alcance 2 casillas (15 balas iniciales)  
* Daño: 20 HP por impacto  
* Condición: Enemigo debe estar en rango Y visible  
* Tecla: **Espacio** o **Enter**

**Opción B: Usar Recurso** Si tienes recursos en el inventario:

* **Repair Kit:** Recupera 30 HP (máximo 100\)  
* **Cooldown Reducer:** Reduce 1 turno el cooldown aéreo  
* **Ammunition Extra:** Añade 5 balas de cada tipo  
* **Movement Limiter:** (se lanza contra el enemigo si está en rango)

**Opción C: No Hacer Nada** Simplemente terminar el turno sin acción.

#### **FASE 4: Fin del Turno** <a id="fase-4:-fin-del-turno"></a>

El sistema ejecuta:

1. Aplicar efectos de fin de turno  
   * Daño por fugas (si las hay)  
   * Reducir cooldowns  
   * Reducir duraciones de efectos  
2. Actualizar HUD  
3. Cambiar a pantalla del siguiente jugador  
4. Mostrar "Turno de \[Jugador\]"

**Una ronda se completa cuando ambos jugadores han jugado su turno.**

Al final de la ronda:

* **Se resuelven ataques aéreos**  
* **El dragón puede moverse**  
* **Se incrementa el contador de ronda**

# **5\. MECÁNICAS DEL JUEGO** <a id="5.-mecánicas-del-juego"></a>

## **5.1 El Tablero de Juego** <a id="5.1-el-tablero-de-juego"></a>

### **5.1.1 Estructura** <a id="5.1.1-estructura"></a>

**Tipo:** Cuadrícula de casillas cuadradas  
**Tamaño:** 5x5 casillas (9x9 vértices)  
**Sistema de Coordenadas:**

* Casillas: Coordenadas impares (1,1), (1,3), (3,1), etc.  
* Vértices: Coordenadas pares (0,0), (2,2), (4,4), etc.  
* Los submarinos se mueven de vértice a vértice 

**Límites:** El mapa tiene bordes sólidos \- no se puede salir de la zona de juego

**Dimensiones Visuales:**

* Tamaño de celda: 40px  
* Tamaño total visual: \~320x320px  
* Posición en pantalla: (250, 100\)

### **5.1.2 Elementos en el Mapa** <a id="5.1.2-elementos-en-el-mapa"></a>

#### **Zonas de Salida (2 en total)** <a id="zonas-de-salida-(2-en-total)"></a>

**Características:**

* **Cantidad:** 1 por jugador  
* **Ubicación:** Esquinas opuestas del tablero  
* **Visibilidad:** Siempre visibles para ambos jugadores  
* **Función:** Al alcanzarla con tu submarino y al terminar la ronda → **Victoria Instantánea**  
* **Tamaño:** 1 vértice

#### **Recursos Dispersos** <a id="recursos-dispersos"></a>

**Cantidad en Mapa:** 8 recursos aleatorios por partida  
 **Aparición:** Distribuidos aleatoriamente al inicio  
 **Recolección:** **Automática** al pasar por encima

**Tipos de Recursos:**

| Recurso | Efecto |
| ----- | ----- |
| **Cooldown Reducer** | Reduce 1 turno el cooldown aéreo |
| **Repair Kit** | Activa minijuego → Recupera hasta 30 HP |
| **Ammunition Extra** | \+5 balas Tipo 1, \+5 balas Tipo 2 |
| **Movement Limiter** | Lanza contra enemigo (si visible) → Restringe su movimiento 2 turnos |

#### **Dragón (NPC Neutral)** <a id="dragón-(npc-neutral)"></a>

**Concepto:** Un dragón vegano que limpia el océano y ayuda a submarinos

**Características:**

* **Movimiento:** Se mueve por el tablero cada vez que un jugador se mueve   
* **Función:** Activa minijuego cuando te encuentras con él  
* **Recompensa:** Recursos según puntuación en el minijuego  
* **Visibilidad:** Solo visible cuando está en tu campo de visión  
* **Tamaño:** Ocupa 1 casilla completa

**Interacción:**

1. Te mueves a un vértice adyacente al dragón  
2. Se activa automáticamente el **Minijuego del Dragón Vegano**  
3. Completas el minijuego (estilo Flappy Bird)  
4. Recibes recompensa según tu puntuación  
5. El dragón se mueve a otra posición

## **5.2 Sistema de Orientación** <a id="5.2-sistema-de-orientación"></a>

**Rotación:**

* Movimiento lateral izquierdo: **\-90°**  
* Movimiento lateral derecho: **\+90°**  
* La orientación determina qué ves en tus 3 ventanas

**Ejemplo:**

Si estás orientado al ESTE (90°):  
├─ Vista Frontal: Mira hacia el ESTE  
├─ Vista Lateral Izq: Mira hacia el NORTE

└─ Vista Lateral Der: Mira hacia el SUR

## **5.3 Sistema de Movimiento** <a id="5.3-sistema-de-movimiento"></a>

**Restricciones:**

* Solo 3 direcciones disponibles por turno  
* Siempre avanzas 1 casilla  
* No puedes retroceder  
* No puedes salir del tablero

**Movimientos Específicos:**

#### **Movimiento Frontal**  <a id="movimiento-frontal"></a>

**Antes: Posición (X, Y), Orientación O**

**Después: Posición (X \+ dx, Y \+ dy), Orientación O**

* No cambia orientación  
* Avanza en la dirección actual

#### **Movimiento Lateral Izquierdo**  <a id="movimiento-lateral-izquierdo"></a>

**Antes: Posición (X, Y), Orientación O**

**Después: Posición (X \+ dx\_izq, Y \+ dy\_izq), Orientación (O \- 90°)**

* Rota 90° a la izquierda  
* Avanza en la nueva dirección

#### **Movimiento Lateral Derecho**  <a id="movimiento-lateral-derecho"></a>

**Antes: Posición (X, Y), Orientación O**

**Después: Posición (X \+ dx\_der, Y \+ dy\_der), Orientación (O \+ 90°)**

* Rota 90° a la derecha  
* Avanza en la nueva dirección

**Efectos Especiales:**

**Movement Limiter** (si te afecta):

* Durante 2 turnos después de ser impactado  
* Solo puedes moverte frontalmente  
* No puedes girar izquierda/derecha  
* El efecto se muestra en tu HUD

## **5.4 Sistema de Combate** <a id="5.4-sistema-de-combate"></a>

### **5.4.1 Disparo Normal (Cañones)**  <a id="5.4.1-disparo-normal-(cañones)"></a>

**Munición Tipo 1 (Corto Alcance):**

* **Alcance:** 1 casilla  
* **Cantidad Inicial:** 15 balas  
* **Daño:** 20 HP  
* **Recarga:** \+5 con Ammunition Extra  
* **Uso:** Enemigos cercanos, combate directo

**Munición Tipo 2 (Largo Alcance):**

* **Alcance:** 2 casillas  
* **Cantidad Inicial:** 15 balas  
* **Daño:** 20 HP  
* **Recarga:** \+5 con Ammunition Extra  
* **Uso:** Enemigos lejanos, mayor versatilidad

**Requisitos para Disparar:**

1. Tener munición del tipo adecuado  
2. Enemigo dentro del rango  
3. Enemigo visible en tus ventanas de vista  
4. Línea de visión clara

**Mecánica:**

1. Presionas tecla de disparo  
2. Se abre ventana de selección de tipo de munición  
3. Seleccionas Tipo 1 o Tipo 2  
4. Si el enemigo está en rango: **IMPACTO** (daño instantáneo)  
5. Si está fuera de rango: **FALLO** (munición perdida)

## **5.4 Sistema de Vida** <a id="5.4-sistema-de-vida"></a>

**Especificaciones:**

* **HP Máximo:** 100  
* **HP Inicial:** 100  
* **Muerte:** HP \= 0 → Victoria del enemigo

**Fuentes de Daño:**

| Fuente | Daño | Frecuencia |
| ----- | ----- | ----- |
| Disparo Tipo 1 | 20 HP | Por impacto |
| Disparo Tipo 2 | 20 HP | Por impacto |
| Ataque Aéreo | 30 HP | Por impacto |
| Fugas (Leaks) | Variable | Por turno |

**Sistema de Fugas:**

* Si recibes daño, puedes desarrollar fugas  
* Las fugas causan daño adicional cada turno  
* Cantidad: leakDamagePerTurn (variable)  
* Se reparan usando **Repair Kit** (minijuego)

**Recuperación de HP:**

* **Repair Kit:** Activa minijuego → Hasta \+30 HP  
* Máximo siempre 100 HP (no puede exceder)

**Indicador Visual:**

* Barra de vida en HUD  
* Color: Verde (\>66%), Amarillo (33-66%), Rojo (\<33%)  
* Número exacto mostrado: "HP: 80/100"

## **5.5 Sistema de Recursos** <a id="5.5-sistema-de-recursos"></a>

**Gestión de Inventario:**

* **Capacidad:** Ilimitada  
* **Uso:** Manual (excepto recolección que es automática)  
* **Visibilidad:** Mostrado en HUD

#### **Recurso 1: Repair Kit**  <a id="recurso-1:-repair-kit"></a>

**Función:** Repara el submarino

**Uso:**

1. En el estado reservado para utilizar el kit, decidir si usarlo o no  
2. Se activa **Minijuego de Reparación**  
3. Según tu puntuación: recuperas hasta 30 HP  
4. Las fugas se reparan automáticamente

**Minijuego:**

* Tipo: Reparación de fugas con mecánicas de física  
* Duración: \~30 segundos  
* Objetivo: Sellar el máximo de fugas posible  
* Recompensa: HP proporcional al éxito

#### **Recursos No Funcionales (Scripts Existen)** <a id="recursos-no-funcionales-(scripts-existen)"></a>

##### **Cooldown Reducer**  <a id="cooldown-reducer"></a>

**Estado:** Script implementado pero NO integrado

**Razón:**

* No existe sistema de ataque aéreo activo  
* El recurso no tiene utilidad en el juego actual  
* Código presente en carpeta de recursos

##### **Ammunition Extra**  <a id="ammunition-extra"></a>

**Estado:** Script implementado pero NO integrado

**Razón:**

* No está en el flujo de juego  
* Las municiones se usan pero no se recargan con este recurso  
* Código presente en carpeta de recursos

# **6\. SISTEMAS DEL JUEGO** <a id="6.-sistemas-del-juego"></a>

## **6.1 Sistema de Turnos** <a id="6.1-sistema-de-turnos"></a>

**Implementación:** Máquinas de Estado

**Estructura:**

* Cada jugador tiene fases definidas  
* Movimiento → Acción → Fin de Turno  
* Los turnos alternan entre jugadores  
* Una ronda \= 2 turnos (uno por jugador)

**Flujo:**

**INICIO TURNO**  
    **↓**  
**\[Fase Movimiento\]**  
    **↓**  
**\[Fase Acción\]**  
    **↓**  
**\[Fin Turno\]**  
    **↓**

**CAMBIO DE JUGADOR**

## **6.2 Sistema de Eventos** <a id="6.2-sistema-de-eventos"></a>

**Implementación:** Patrón Observer

**Ventajas:**

* Comunicación desacoplada entre sistemas  
* Fácil extensión de funcionalidad  
* Separación clara de responsabilidades

**Eventos Principales:**

* Movimiento de submarino  
* Disparo de arma  
* Uso de recurso  
* Fin de turno  
* Actualización de UI

## **6.3 Sistema de Visibilidad** <a id="6.3-sistema-de-visibilidad"></a>

**Vista del Submarino:**

* 3 Ventanas simultáneas  
* Ventana Central (Frontal) \- Más grande  
* Ventanas Laterales (Izq/Der) \- Más pequeñas

**Alcance:** 2 casillas por dirección

**Elementos Visibles:**

* Submarino enemigo (si está en rango)  
* Recursos (si están en rango)  
* Dragón (si está en rango)  
* Bordes del tablero

## **6.4 Sistema de Zonas de Salida** <a id="6.4-sistema-de-zonas-de-salida"></a>

**Características:**

* Cada jugador tiene 1 zona  
* Ubicadas en esquinas opuestas  
* Visibles en todo momento  
* Tamaño: 1 vértice

**Victoria por Escape:**

* Submarino alcanza su zona  
* Victoria inmediata  
* No necesita destruir al enemigo

## **6.5 Sistema de Cierre de Zona** <a id="6.5-sistema-de-cierre-de-zona"></a>

**Concepto:**

* Mapa se reduce progresivamente  
* Fuerza encuentros entre jugadores  
* Tamaño mínimo: 4x4

**Descripción completa del funcionamiento:**

* Activación en turno 15  
* Advertencia en turno 12  
* Cierra cada 3 turnos  
* Daño de 25 HP por turno en zona cerrada  
*  Efectos visuales (zonas rojas, flashes)  
* Eliminación automática de zonas de salida

# **7\. INTERFAZ DE USUARIO** <a id="7.-interfaz-de-usuario"></a>

## **7.1 Sistema de Pantalla por Turnos** <a id="7.1-sistema-de-pantalla-por-turnos"></a>

**Diseño:** Vista alternada por jugador

Durante el turno de un jugador:

* Solo se muestra su información  
* Su HUD es visible  
* El HUD del otro jugador está oculto  
* Texto indica de quién es el turno

Al cambiar de turno:

* Transición visual  
* Se oculta info del jugador anterior  
* Se muestra info del jugador actual  
* Texto actualiza "Turno de \[Jugador\]"

**Ventajas:**

* Mejor información asimétrica  
* Evita "screen peeking"  
* Pantalla menos saturada  
* Más clara y legible

## **7.2 HUD (Head-Up Display)** <a id="7.2-hud-(head-up-display)"></a>

**Ubicación:** Esquina inferior derecha

**Información Mostrada:**

#### **Identificación** <a id="identificación"></a>

* Nombre del jugador (Japón/China)  
* Color del submarino

#### **Vida** <a id="vida"></a>

* HP actual/máximo  
* Barra visual con colores  
* Verde/Amarillo/Rojo según %

#### **Munición** <a id="munición"></a>

* Munición Tipo 1: cantidad  
* Munición Tipo 2: cantidad

#### **Inventario** <a id="inventario"></a>

* Cooldown Reducers: cantidad  
* Repair Kits: cantidad  
* Ammunition Extra: cantidad  
* Movement Limiters: cantidad

#### **Estado** <a id="estado"></a>

* Efectos activos (si los hay)  
* Turnos restantes de efectos

## **7.3 Vista del Submarino** <a id="7.3-vista-del-submarino"></a>

**Distribución:**

┌─────────────────────────────────┐

│        \[Lateral\]         \[Frontal\]               \[Lateral\]               │

│         \[Izq.   \]          \[(Grande)\]               \[Der.   \]                 │

└─────────────────────────────────┘

**Tamaños:**

* Ventana Central: Más grande  
* Ventanas Laterales: Más pequeñas

**Contenido:**

* Frontal: Lo que hay adelante  
* Laterales: Vistas perpendiculares  
* Alcance: 2-3 casillas cada una

## **7.4 Mapa Completo** <a id="7.4-mapa-completo"></a>

**Acceso:** Tecla M

**Muestra:**

* Todo el tablero  
* Zonas de salida (ambas)  
* Dragón (si está activo)  
* Recursos visibles  
* NO muestra: Posición del enemigo

**Función:** Orientación y estrategia

## **7.5 Sistema de Anotaciones del Mapa** <a id="7.5-sistema-de-anotaciones-del-mapa"></a>

**Estado:** Implementado pero con funcionalidad limitada

**Funcionamiento Actual:**

* Con el mapa abierto, click en casilla  
* La casilla se marca visualmente  
* Click de nuevo: desmarca

**Limitaciones:**

* Funcionalidad básica  
* Sin diferentes tipos de marcadores  
* Sin colores distintos  
* Sin notas de texto  
* Puede tener problemas de funcionamiento

**Usos Teóricos:**

* Marcar donde viste al enemigo  
* Marcar posibles ubicaciones  
* Planificar rutas

## **7.6 Elementos Adicionales** <a id="7.6-elementos-adicionales"></a>

**Texto de Ronda:**

* Muestra número de ronda actual  
* Animación al cambiar  
* Centro superior de pantalla

**Texto de Turno:**

* "Turno de China" / "Turno de Japón"  
* Color correspondiente  
* Superior izquierda

**Texto de Fase:**

* Indica fase actual del turno  
* "Movimiento" / "Disparo" / etc.  
* Inferior izquierda

# **8\. MINIJUEGOS** <a id="8.-minijuegos"></a>

## **8.1 Minijuego del Dragón Vegano (Flappy Bird)** <a id="8.1-minijuego-del-dragón-vegano-(flappy-bird)"></a>

**Estado:** Completamente implementado

#### **Concepto** <a id="concepto"></a>

Un dragón vegano baja al océano para recoger basura. El jugador controla al dragón esquivando obstáculos mientras recolecta basura.

#### **Activación** <a id="activación"></a>

* Al encontrarte con el Dragón NPC  
* Transición automática  
* Pantalla de diálogo

#### **Mecánicas** <a id="mecánicas"></a>

**Controles:**

* Barra espaciadora / Click: Aletear (impulso arriba)  
* Gravedad constante hacia abajo  
* Física similar a Flappy Bird

**Objetivo:**

* Recoger máximo de basura  
* No chocar con obstáculos  
* Aguantar el tiempo máximo

**Elementos:**

* Basura: \+1 punto cada una  
* Obstáculos: Fin del minijuego al chocar  
* Fondo: Scrolling horizontal  
* Timer: Límite de tiempo

**Dificultad:**

* Velocidad aumenta  
* Más obstáculos  
* Menos espacio entre tuberías

#### **Recompensas** <a id="recompensas"></a>

Según puntuación:

* 0-5 puntos: 1 recurso aleatorio  
* 6-10 puntos: 2 recursos  
* 11-20 puntos: 3 recursos  
* 21+ puntos: 4 recursos

#### **Fin** <a id="fin"></a>

* Victoria: Tiempo completado  
* Derrota: Choque con obstáculo  
* Retorno: Vuelve al juego con recompensas

## **8.2 Minijuego de Reparación** <a id="8.2-minijuego-de-reparación"></a>

**Estado:** Completamente implementado

#### **Concepto** <a id="concepto-1"></a>

El submarino tiene fugas que deben repararse antes de que se inunde.

#### **Activación** <a id="activación-1"></a>

* Al usar Repair Kit del inventario  
* Transición a escena de minijuego

#### **Mecánicas** <a id="mecánicas-1"></a>

**Objetivo:**

* Sellar máximo de fugas posibles  
* Contra reloj (30 segundos)  
* Cada fuga sellada \= HP restaurado

**Elementos:**

* Fugas: Agujeros en el casco  
* Click para sellar  
* Nivel de agua: Sube constantemente  
* Timer: 30 segundos

**Progresión:**

* Segundos 0-10: Fugas lentas  
* Segundos 11-20: Fugas medias  
* Segundos 21-30: Fugas rápidas

#### **Curación** <a id="curación"></a>

HP Recuperado \= (Fugas Selladas × 5\) \+ Bonificaciones

**Bonificaciones:**

* 3 fugas seguidas: \+5 HP  
* Antes de 20 segundos: \+10 HP  
* Todas las fugas: \+15 HP  
* Máximo: 30 HP

#### **Fin** <a id="fin-1"></a>

* Tiempo terminado: Aplica curación  
* Todas fugas selladas: Victoria perfecta  
* Retorno automático tras resumen

# **9\. CONDICIONES DE VICTORIA** <a id="9.-condiciones-de-victoria"></a>

## **9.1 Victoria por Eliminación**  <a id="9.1-victoria-por-eliminación"></a>

**Condición:** Reducir HP del enemigo a 0

**Métodos:**

* Disparos normales (20 HP cada uno)  
* Combinación de múltiples disparos  
* Acumulación de daño progresivo

**Cálculo:**

* 5 disparos normales \= 100 HP  
* Combinación óptima depende de munición disponible

## **9.2 Victoria por Escape**  <a id="9.2-victoria-por-escape"></a>

**Condición:** Alcanzar tu zona de salida

**Características:**

* Victoria instantánea  
* No necesitas destruir al enemigo  
* Válida si estás en desventaja  
* Requiere planificación de ruta

**Situaciones Típicas:**

* HP bajo: Preferir escape que combate  
* Sin munición: Solo puedes escapar  
* Enemigo bloqueando: Desviar primero  
* Carrera: Ambos intentando escapar

## **9.3 Victoria por Rendición** <a id="9.3-victoria-por-rendición"></a>

**Casos sin salida:**

* Enemigo en zona de salida y tú bloqueado  
* Sin munición Y enemigo entre tú y tu salida  
* HP crítico sin recursos

**Mecánica:**

* No hay botón formal  
* Acuerdo entre jugadores

## **9.4 Pantalla de Victoria** <a id="9.4-pantalla-de-victoria"></a>

**Elementos:**

* Ganador mostrado (Japón/China)  
* Tipo de victoria (Eliminación/Escape)  
* Estadísticas de la partida  
* Opciones: Jugar de nuevo, Menú, Salir

# 

# **10\. ARQUITECTURA TÉCNICA** <a id="10.-arquitectura-técnica"></a>

## **10.1 Tecnologías** <a id="10.1-tecnologías"></a>

**Motor:** Phaser 3

* Framework HTML5 para juegos 2D  
* Sistema de física Arcade  
* Gestión de escenas

**Lenguajes:**

* JavaScript (ES6+)  
* HTML5  
* CSS3

**Patrones de Diseño:**

* State Machine (turnos y acciones)  
* Observer (sistema de eventos)  
* Composition (entidades del juego)  
* Publisher-Subscriber(bus de evento)

## **10.2 Estructura General** <a id="10.2-estructura-general"></a>

El proyecto está organizado en módulos:

* Tablero y lógica espacial  
* Submarinos y sus sistemas  
* Máquinas de estado  
* Sistema de recursos  
* Minijuegos  
* Escenas de Phaser  
* Sistema de eventos

## **10.3 Configuración** <a id="10.3-configuración"></a>

**Parámetros del Juego:**

* Tablero: 5x5 casillas  
* Recursos en mapa: 8  
* HP inicial: 100  
* Munición inicial: 15 de cada tipo

**Pantalla:**

* Resolución: 800x600  
* Renderizado pixel-perfect  
* Auto-centrado horizontal

## **10.4 Valores Balanceados** <a id="10.4-valores-balanceados"></a>

**Vida y Daño:**

* HP Máximo: 100  
* Disparo normal: 20 HP  
* Curación (Repair Kit): Hasta 30 HP

**Munición:**

* Tipo 1/2 inicial: 15 balas cada uno  
* Recarga: \+5 de cada tipo

**Recursos:**

* Cantidad en mapa: 8  
* Distribución: Aleatoria

**Efectos:**

* Movement Limiter: 2 turnos

**Minijuegos:**

* Dragón: \~60 segundos  
* Reparación: 30 segundos

## **10.5 Rendimiento** <a id="10.5-rendimiento"></a>

**Objetivo:** 60 FPS constante

**Optimizaciones:**

* Sprites reutilizables  
* Actualización solo de elementos visibles  
* Estados bien definidos  
* Eventos desacoplados

**Requisitos Mínimos:**

* Navegador moderno con WebGL  
* Procesador dual core  
* 2 GB RAM

# **11\. CARACTERÍSTICAS ADICIONALES IMPLEMENTADAS** <a id="11.-características-adicionales-implementadas"></a>

Estas características fueron implementadas durante el desarrollo pero NO estaban en el GDD original:

## **11.1 Sistema de Estadísticas de Partida** <a id="11.1-sistema-de-estadísticas-de-partida"></a>

**Implementado**

**Descripción:** El juego guarda y muestra estadísticas al final de cada partida.

**Características:**

* Contador de disparos realizados  
* HP restante de cada jugador  
* Recursos utilizados  
* Rondas jugadas  
* Tipo de victoria

**Uso:**

* Se muestra en pantalla de victoria  
* Disponible para opción de revancha  
* NO persistente entre sesiones

**Pantalla de Victoria:**

* Muestra todas las estadísticas  
* Permite analizar la partida  
* Base para decisión de revancha

## **11.2 Sistema de Revancha** <a id="11.2-sistema-de-revancha"></a>

**Implementado**

**Descripción:** Los jugadores pueden jugar una revancha inmediata manteniendo el contexto.

**Características:**

* Botón "Revancha" en pantalla victoria  
* Reinicia partida rápidamente  
* Mantiene jugadores y configuración  
* Nueva distribución de recursos

**Ventajas:**

* Partidas rápidas consecutivas  
* No volver al menú  
* Mejora experiencia multijugador local

**Limitaciones:**

* No guarda historial de revancha  
* No contador de partidas ganadas

# **12\. CARACTERÍSTICAS NO IMPLEMENTADAS** <a id="12.-características-no-implementadas"></a>

Estas características estaban planeadas en el GDD original pero NO se implementaron:

## **12.1 Mecánicas de Combate No Completadas** <a id="12.1-mecánicas-de-combate-no-completadas"></a>

### **Sistema de Ataque Aéreo (Bombardeo)** <a id="sistema-de-ataque-aéreo-(bombardeo)"></a>

**Planeado:**

* Bombardeo de cualquier casilla  
* Cooldown 2-3 turnos  
* Daño: 30 HP  
* Sin línea de visión  
* Predicción posición enemiga

**Estado:**

* NO implementado  
* Recurso Cooldown Reducer sin utilidad

**Impacto:**

* Elimina opción táctica de ataque sin visión  
* Reduce complejidad estratégica

## **12.2 Sistema de Mapa Anotable Completo** <a id="12.2-sistema-de-mapa-anotable-completo"></a>

### **Anotaciones Limitadas** <a id="anotaciones-limitadas"></a>

**Planeado:**

* Sistema completo de marcadores  
* Diferentes símbolos (X, ?, \!, peligro)  
* Colores por tipo  
* Notas de texto  
* Separado por jugador  
* Historial

**Estado Actual:**

* Quitado del juego para no generar confusión.

**Impacto:**

* Reduce capacidad de rastrear info  
* Menos profundidad estratégica

## **12.3 Minijuegos No Implementados** <a id="12.3-minijuegos-no-implementados"></a>

### **Esquivar Minas** <a id="esquivar-minas"></a>

**Concepto:** Endless runner esquivando minas  
**Dificultad:** Baja  
**Recompensa:** Recursos

### **Impacto Preciso (Angry Birds)** <a id="impacto-preciso-(angry-birds)"></a>

**Concepto:** Torpedos con ángulo y fuerza  
**Dificultad:** Media  
**Recompensa:** Munición extra

### **Sumo Submarino** <a id="sumo-submarino"></a>

**Concepto:** Empujar enemigo fuera de ring  
**Dificultad:** Media  
**Recompensa:** Recursos variados

### **Proyectiles Rebotantes** <a id="proyectiles-rebotantes"></a>

**Concepto:** Disparos rebotan en paredes  
**Dificultad:** Alta  
**Recompensa:** Munición especial

### **Carrera con Obstáculos** <a id="carrera-con-obstáculos"></a>

**Concepto:** Esquivar rocas cayendo  
**Dificultad:** Baja  
**Recompensa:** Mejoras velocidad

**Impacto Total:** Solo 2 de 7 minijuegos (28%)

## **12.4 Elementos del Mapa** <a id="12.4-elementos-del-mapa"></a>

### **Obstáculos Estáticos** <a id="obstáculos-estáticos"></a>

**Planeado:**

* Rocas, arrecifes, estructuras  
* 3-5 por mapa  
* Bloquean movimiento y visión  
* Posiblemente destructibles

**Estado:** No implementado

**Impacto:** Reduce complejidad táctica

### **Obstáculos Dinámicos** <a id="obstáculos-dinámicos"></a>

**Planeado:**

* Elementos móviles  
* Corrientes afectan movimiento  
* Zonas visibilidad reducida

**Estado:** No implementado

## **12.5 Mecánicas de Colocación** <a id="12.5-mecánicas-de-colocación"></a>

### **Colocación Inicial Libre** <a id="colocación-inicial-libre"></a>

**Planeado:**

* Jugadores eligen posición  
* Turnos alternos colocación  
* Estrategia desde inicio

**Implementado:** Posiciones fijas

**Impacto:** Menos control inicial

## **12.6 Sistema de Recolección** <a id="12.6-sistema-de-recolección"></a>

### **Recolección Manual** <a id="recolección-manual"></a>

**Planeado:**

* Opción recoger o dejar  
* Decisión estratégica  
* Negar recursos al enemigo

**Implementado:** Completamente automática

**Impacto:** Elimina decisión táctica

## **12.7 Visibilidad y Detección** <a id="12.7-visibilidad-y-detección"></a>

### **Sistema de Ocultación Completo** <a id="sistema-de-ocultación-completo"></a>

**Planeado:**

* Enemigo completamente oculto  
* Detección por proximidad  
* Pistas indirectas (sonidos, estela)

**Implementado:** Sistema visual básico

### **Pantalla Dividida Simultánea** <a id="pantalla-dividida-simultánea"></a>

**Planeado Original:**

* Ambos ven a la vez  
* Pantalla dividida

**Implementado:** Sistema alternado

## **12.8 Guardado y Persistencia** <a id="12.8-guardado-y-persistencia"></a>

### **Sistema de Guardado de Partidas** <a id="sistema-de-guardado-de-partidas"></a>

**Planeado:**

* Guardar partidas en progreso  
* Continuar desde menú  
* Múltiples slots

**Estado:**

* Guarda stats para revancha  
* Muestra stats en victoria  
* NO se puede continuar desde menú  
* NO guarda partidas en progreso

**Implementado:**

* Sistema temporal de estadísticas  
* Solo durante sesión activa  
* Se pierde al cerrar

### **Estadísticas Persistentes** <a id="estadísticas-persistentes"></a>

**Planeado:**

* Historial victorias/derrotas  
* Estadísticas acumuladas  
* Récords personales  
* Progreso general

**Estado:** No implementado

## **12.9 Contenido Adicional** <a id="12.9-contenido-adicional"></a>

### **Tutorial** <a id="tutorial"></a>

**Planeado:**

* Tutorial interactivo completo  
* Todas las mecánicas  
* Práctica guiada  
* Tips estratégicos

**Implementado:** Tutorial básico limitado

### **Menú de Configuración** <a id="menú-de-configuración"></a>

**Planeado:**

* Ajustes volumen  
* Opciones gráficas  
* Controles  
* Preferencias

**Implementado:** Menú básico

# **CONCLUSIÓN** <a id="conclusión"></a>

**Pacific Tactics** es un juego completamente funcional y jugable que implementa exitosamente el core gameplay principal. Con mecánicas de deducción, combate táctico y gestión de recursos, ofrece una experiencia estratégica única.

## **Estado Actual** <a id="estado-actual"></a>

**Completamente Implementado:**

* Sistema de turnos alternados  
* Movimiento con 4 opciones (incluyendo quieto)  
* Combate con 2 tipos de munición  
* 2 recursos funcionales (Repair Kit, Movement Limiter)  
* 2 minijuegos completos con física  
* Sistema de vida y daño  
* Zonas de escape  
* Sistema de cierre de zona progresivo  
* Dragón NPC  
* Interfaz completa  
* Sistema estadísticas de partida  
* Sistema de revancha

**Parcialmente Implementado:**

* Tutorial (básico)  
* Menú (básico)

**Scripts Existen Pero No Integrados:**

* Cooldown Reducer (sin ataque aéreo)  
* Ammunition Extra (sin integración)

**No Implementado:**

* Ataque aéreo/bombardeo  
* 5 minijuegos adicionales  
* Obstáculos en el mapa  
* Sistema completo de anotaciones  
* Guardado de partidas en progreso  
* Estadísticas persistentes

## **Conclusión Final** <a id="conclusión-final"></a>

El juego cumple su promesa principal: ofrecer combate submarino táctico con información asimétrica. La base es sólida y el gameplay es divertido.

Durante el desarrollo se añadieron mejoras no planeadas (estadísticas, revancha) que enriquecen la experiencia, mientras que algunas características planeadas (ataque aéreo, minijuegos extra) quedaron sin implementar por limitaciones de tiempo.

**El juego está listo para jugar y disfrutar en su estado actual.**

