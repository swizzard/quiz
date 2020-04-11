import { del, post } from './db';

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
  return post(ep, data, true);
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
      'code,quiz(name,quiz_round(round_no,question(question,answer(answer,points))))',
  };
  return get(ep, params);
}

export function getGame(userId, code) {
  const ep = '/game_participant';
  const params = {
    code,
    player_id: `eq.${userId}`,
    'game.completed': 'is.false',

    select: 'game(quiz(name,quiz_round(round_no,question(question))))',
  };
  return get(ep, params);
}
