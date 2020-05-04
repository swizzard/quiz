import { deepSet, removeAt } from "../utils";

const ADD_ANSWER = "add_answer";
const CHANGE_ANSWER = "change_answer";
const DELETE_ANSWER = "delete_answer";

const ADD_ROUND = "add_round";
const DELETE_ROUND = "delete_round";

const ADD_QUESTION = "add_question";
const CHANGE_QUESTION = "change_question";
const DELETE_QUESTION = "delete_question";

const CHANGE_NAME = "change_name";

export function draftGameReducer(state, action) {
  switch (action.type) {
    case ADD_ANSWER:
      return deepSet(state, [...state.quizRounds[action.roundIx].questions[action.qIx].answers, { answer: "", points: 0 }], ["quizRounds", action.roundIx, "questions", action.qIx, "answers"]);
    case CHANGE_ANSWER:
      return deepSet(state, { points: action.points, answer: action.answer }, ["quizRounds", action.roundIx, "questions", action.qIx, "answers", action.answerIx]);
    case DELETE_ANSWER:
      return deepSet(state, removeAt(state.quizRounds[action.roundIx].questions[action.qIx].answers, action.answerIx), ["quizRounds", action.roundIx, action.qIx, "answers"]);
    case ADD_ROUND:
      return deepSet(state, [...state.quizRounds, { questions: [] }], "quizRounds");
    case DELETE_ROUND:
      return deepSet(state, removeAt(state.quizRounds, action.roundIx), "quizRounds");
    case ADD_QUESTION:
      return deepSet(state, [...state.quizRounds[action.roundIx].questions, { question: "", answers: [] }], ["quizRounds", action.roundIx, "questions"]);
    case CHANGE_QUESTION:
      return deepSet(
        state,
        {
          question: action.question,
          answers: state.quizRounds[action.roundIx].questions[action.qIx].answers
        },
        ["quizRounds", action.roundIx, "questions", action.qIx]
      );
    case DELETE_QUESTION:
      return deepSet(state, removeAt(state.quizRounds[action.roundIx].questions, action.qIx), ["quizRounds", action.roundIx]);
    case CHANGE_NAME:
      return deepSet(state, action.name, "quizName");
    default:
      console.log(`INVALID ACTION ${action.type}`);
      return state;
  }
}

export const types = {
  ADD_ANSWER,
  CHANGE_ANSWER,
  DELETE_ANSWER,
  ADD_ROUND,
  DELETE_ROUND,
  ADD_QUESTION,
  CHANGE_QUESTION,
  DELETE_QUESTION,
  CHANGE_NAME
};
