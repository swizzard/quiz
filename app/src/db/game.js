import { del, get, patch, post } from './db';

export function postAnswers({ id }, answers) {
  const ep = '/rpc/user_answers';
  const data = {
    userId: id,
    answers,
  };
  return post(ep, data, true);
}

export function submitDraft({ id }, name, questions) {
  const ep = '/rpc/draft_game';
  const data = {
    userId: id,
    name,
    questions,
  };
  return post(ep, data, (single = true));
}

export function deleteGame(userId, gameId) {
  const ep = '/quiz';
  const params = { id: `eq.${gameId}`, creator: `eq.${userId}` };
  return del(ep, params);
}

export function getHostGames(userId) {
  const ep = '/game';
  const params = {
    'quiz.creator_id': `eq.${userId}`,
    completed: 'is.false',
    select:
      'code,quiz(name,quizRound:quiz_round(roundNo:round_no,questions:question(question,answers:answer(answer,points))))',
  };
  return get(ep, params);
}

export function getGame(userId, code) {
  const ep = '/game_participant';
  const params = {
    code,
    player_id: `eq.${userId}`,
    'game.completed': 'is.false',

    select:
      'game(quiz(name,quizRound:quiz_round(questions:question(answer(id)))))',
  };
  return get(ep, params);
}

export function createHostedGame(userId, gameId) {
  const ep = '/rpc/host_game';
  const data = {
    userId,
    gameId,
  };
  return post(ep, data, (single = true));
}

export function getParticipants(code) {
  const ep = '/game_participant';
  const params = {
    'game.code': code,
    select: 'id,player(displayName:display_name)',
  };
  return get(ep, params);
}

export function getParticipantAnswers({ id: gameId }) {
  const ep = '/game_participant';
  const params = {
    game_id: `eq.${gameId}`,
    select:
      'participantId:id,responses:participant_response' +
      '(response,answer(points,answer,question(questionId:id,question,round(roundNo:round_no))))',
    'round.order': 'round_no.asc',
    'question.order': 'question_no.asc',
  };
  return get(ep, params);
}

export function submitScore(participantId, score) {
  const ep = '/game_participant';
  const params = {
    id: `eq.${participantId}`,
  };
  const data = {
    score,
  };
  return patch(ep, params, data);
}
