import { deepSet, removeAt, reorder } from '../utils';

const ADD_ANSWER = 'add_answer';
const CHANGE_ANSWER = 'change_answer';
const DELETE_ANSWER = 'delete_answer';
const REORDER_ANSWER = 'reorder_answer';

const ADD_ROUND = 'add_round';
const DELETE_ROUND = 'delete_round';
const REORDER_ROUND = 'reorder_round';

const ADD_QUESTION = 'add_question';
const CHANGE_QUESTION = 'change_question';
const DELETE_QUESTION = 'delete_question';
const REORDER_QUESTION = 'reorder_question';

const CHANGE_NAME = 'change_name';

export const types = {
  ADD_ANSWER,
  CHANGE_ANSWER,
  DELETE_ANSWER,
  REORDER_ANSWER,
  ADD_ROUND,
  DELETE_ROUND,
  REORDER_ROUND,
  ADD_QUESTION,
  CHANGE_QUESTION,
  DELETE_QUESTION,
  REORDER_QUESTION,
  CHANGE_NAME
};

export function draftGameReducer(state, action) {
  let fn;
  switch (action.type) {
    case ADD_ANSWER:
      fn = add_answer;
      break;
    case CHANGE_ANSWER:
      fn = change_answer;
      break;
    case DELETE_ANSWER:
      fn = delete_answer;
      break;
    case REORDER_ANSWER:
      fn = reorder_answer;
      break;
    case ADD_ROUND:
      fn = add_round;
      break;
    case DELETE_ROUND:
      fn = delete_round;
      break;
    case REORDER_ROUND:
      fn = reorder_round;
      break;
    case ADD_QUESTION:
      fn = add_question;
      break;
    case CHANGE_QUESTION:
      fn = change_question;
      break;
    case DELETE_QUESTION:
      fn = delete_question;
      break;
    case REORDER_QUESTION:
      fn = reorder_question;
      break;
    case CHANGE_NAME:
      fn = change_name;
      break;
    default:
      fn = invalid_action;
      break;
  }
  return fn(state, action);
}

function add_answer(state, action) {
  return deepSet(
    state,
    [
      ...state.quizRounds[action.roundIx].questions[action.qIx].answers,
      { answer: '', points: 0 }
    ],
    ['quizRounds', action.roundIx, 'questions', action.qIx, 'answers']
  );
}

function change_answer(state, action) {
  return deepSet(state, { points: action.points, answer: action.answer }, [
    'quizRounds',
    action.roundIx,
    'questions',
    action.qIx,
    'answers',
    action.answerIx
  ]);
}

function delete_answer(state, action) {
  return deepSet(
    state,
    removeAt(
      state.quizRounds[action.roundIx].questions[action.qIx].answers,
      action.answerIx
    ),
    ['quizRounds', action.roundIx, 'questions', action.qIx, 'answers']
  );
}

function reorder_answer(state, action) {
  return reorder(state, action.answerIx, action.step, [
    'quizRounds',
    action.roundIx,
    'questions',
    action.qIx,
    'answers'
  ]);
}

function add_round(state, _action) {
  return deepSet(state, [...state.quizRounds, { questions: [] }], 'quizRounds');
}

function delete_round(state, action) {
  return deepSet(
    state,
    removeAt(state.quizRounds, action.roundIx),
    'quizRounds'
  );
}

function reorder_round(state, action) {
  return reorder(state, action.roundIx, action.step, ['quizRounds']);
}

function add_question(state, action) {
  return deepSet(
    state,
    [
      ...state.quizRounds[action.roundIx].questions,
      { question: '', answers: [] }
    ],
    ['quizRounds', action.roundIx, 'questions']
  );
}

function change_question(state, action) {
  return deepSet(
    state,
    {
      question: action.question,
      answers: state.quizRounds[action.roundIx].questions[action.qIx].answers
    },
    ['quizRounds', action.roundIx, 'questions', action.qIx]
  );
}

function delete_question(state, action) {
  return deepSet(
    state,
    removeAt(state.quizRounds[action.roundIx].questions, action.qIx),
    ['quizRounds', action.roundIx, 'questions']
  );
}

function reorder_question(state, action) {
  return reorder(state, action.qIx, action.step, [
    'quizRounds',
    action.roundIx,
    'questions'
  ]);
}

function change_name(state, action) {
  return deepSet(state, action.name, 'quizName');
}

function invalid_action(state, action) {
  console.log(`INVALID ACTION ${action.type}`);
  return state;
}
