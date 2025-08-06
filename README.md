# Build Your Own GPT Bot – SOC'25 Project  
**Author:** DineshBaghelDev (IIT Bombay)

**Project Goal:** To design, implement, and demonstrate a custom GPT-powered chatbot capable of handling various real-world applications using NLP, Langchain, and Botpress.

---

## Project Overview

This repository documents my journey in the SOC'25 (Summer of Code 2025) program, where I focused on building intelligent bots powered by LLMs for practical scenarios like plagiarism detection, legal assistance, UG academic guidance, and general-purpose AI chatbots. These are structured under key **milestones**, reflecting progress through different NLP tasks and bot capabilities.

---

## Repository Structure

- ### `1/`
  - **Chapter 1:** Basic NLP concepts like tokenization, encoding, word2vec.  
  - **Status:** Foundation work for GPT-based understanding.
  
- ### `Milestone 1/`
  - **Title:** Plagiarism Detector  
  - **Details:** Implemented two approaches for plagiarism detection using sentence embeddings and cosine similarity.  
  - **Key Concepts:** NLP preprocessing, similarity checks  
  - **Accuracy:** N/A

- ### `Milestone 2/`
  - Creating a movie review model using basics 

- ### `Milestone 3/`
  - **Enhancement:** Sentiment Analysis Model using LSTM (classify movie reviews as positive/negative) same as milestone 2 but now we are be going to use transformer for embeddings.
  - **Achieved Accuracy:** **81.5%**  

- ### `AI-ChatBot/` (Milestone 4)
  - **Title:** Generic AI Chatbot  
  - **Features:** Basic LLM interaction framework.  
  - **Video:** `AI ChatBot Demo.mp4`

- ### `Milestone-5 IITB UG Guidebot/`
  - **Title:** UG Academic Guide Bot  
  - **Purpose:** Help new IITB UG students with curriculum, departments, and academic FAQs.  
  - **Demo:** `Milestone -5 IIT-UG guide guide BOT.mp4`

- ### `Milestone 6 - Legal Advisor Bot/`
  - **Objective:** Prototype an LLM-powered legal advisor using domain-specific prompts.
  - Implemented 2 verions of this bot. One with Botpress and one with Langchain.
  - **Implementation:**  
    - `Milestone 6 - Botpress.mp4`: Demonstrates GUI-based workflow created by botpress.  
    - `Milestone 6 - Langchain.mp4`: Langchain-powered modular backend and Chatbot.

---

## Learning Journey

### NLP Foundation
Started with understanding the basics of tokenization, encoding techniques (one-hot, TF-IDF, word2vec), sentence similarity, and plagiarism detection methods.

### Artificial Neural Networks.
- Simple ANNs using pytorch.
- RNNs, CNNs and LSTM
- RAG, Dataclasses and DataLoader

### Real-World Bot Use Cases
Each milestone pushed complexity:
- From simple semantic similarity checks → full-fledged LLM conversation flow using Langchain.
- From static responses → dynamic tools using Botpress flows.

### Tools & Technologies
- **Python** (Core NLP logic, Jupyter notebooks)
- **Langchain** (Agentic and modular bot reasoning)
- **Botpress** (Visual builder for flow-based chatbots)
- **Gemini / local LLMs** (Used for inference and conversation)
- **VS Code, GitHub** for versioning, dev workflow

---

## Demo Videos

All major implementations are supported by demo videos inside the repo:
- `AI ChatBot Demo.mp4`
- `Milestone -5 IIT-UG guide guide BOT.mp4`
- `Milestone 6 - Botpress.mp4`
- `Milestone 6 - Langchain.mp4`

---

## Final Thoughts

This SOC'25 project helped me understand how to practically deploy GPT bots with custom functionalities. The progression from simple tasks to real-use-case bots (legal advisor, guidebot) enhanced my command over:
- Modular NLP pipelines
- Prompt engineering
- LLM orchestration
- Human-bot interaction design
- Retrieval augumented generation (RAG)

---

## Contact

Feel free to reach out for collaborations, suggestions, or feedback:  
**LinkedIn:** [Dinesh Baghel](https://www.linkedin.com/in/dineshbaghel/)  
**Portfolio:** [homepages.iitb.ac.in/~24b4211](https://homepages.iitb.ac.in/~24b4211/)

---

