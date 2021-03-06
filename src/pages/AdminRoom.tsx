import { FormEvent, useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";
import checkImg from "../assets/images/check.svg";
import answerImg from "../assets/images/answer.svg";
import menuImg from '../assets/images/menu.svg';
import cancelImg from '../assets/images/cancel-menu.svg';
import darkModeLogoImg from '../assets/images/dark-mode-logo.svg';
import moonImg from '../assets/images/moon.svg'
import sunImg from '../assets/images/sun.svg'

import { RoomCode } from "../components/RoomCode";
import { Button } from "../components/Button";
import { Question } from "../components/Question";
import { useRoom } from "../hooks/useRoom";
import { database } from "../services/firebase";

// import { useAuth } from "../hooks/useAuth";

import "../styles/room.scss";
import { useTheme } from "../hooks/useTheme";

type RoomParams = {
  id: string;
};

export function AdminRoom() {
  // const { user } = useAuth();
  const params = useParams<RoomParams>();
  const roomId = params.id;
  const history = useHistory();

  const { title, questions } = useRoom(roomId);

  const [ isMenuOpen, setIsMenuOpen ] = useState<boolean>(false);

  const { theme, toggleTheme } = useTheme();

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push("/");
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm("Tem certeza que você deseja excluir esta pergunta?")) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  return (
    <div id="page-room" className={theme}>
      <header>
        <div className="content">
        <img src={theme === 'light' ? logoImg : darkModeLogoImg} alt="Letmeask" />

          <div className="menus">

            <div className="menu-fullscreen">
              <RoomCode code={roomId} />
              <Button isOutlined onClick={handleEndRoom}>
                Encerrar sala
              </Button>
              <button 
                className="changeThemeButton"
                onClick={toggleTheme}>
                  <img src={theme === 'light' ? moonImg : sunImg} alt="" />
              </button>
            </div>

            <div className="menu-mobile">
              <button 
                className="changeThemeButton"
                onClick={toggleTheme}>
                  <img src={theme === 'light' ? moonImg : sunImg} alt="" />
              </button>
              <img 
                onClick={() => {setIsMenuOpen(!isMenuOpen)}} 
                src={isMenuOpen ? cancelImg : menuImg}  
                alt="menu" 
              />
              <div className={isMenuOpen ? 'menu-opened' : 'menu-closed'}>
                <RoomCode code={roomId} />
                <Button isOutlined onClick={handleEndRoom}>
                  Encerrar sala
                </Button>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span> {questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCheckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar pergunta como respondida"/>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={answerImg} alt="Dar destaque a pergunta" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            );
          })}
        </div>
      </main>
    </div>
  );
}
