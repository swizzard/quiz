import { del, get, patch, post } from "./db";

export function postAnswers(participantId, answers) {
  const ep = "rpc/user_answers";
  const data = {
    userId: participantId,
    answers
  };
  return post(ep, data, {}, true);
}

export function submitDraft({ id }, name, questions) {
  const ep = "rpc/draft_game";
  const data = {
    userId: id,
    name,
    questions
  };
  return post(ep, data, {}, true);
}

export function updateDraft({ id: userId }, quizId, quizName, questions) {
  const ep = "rpc/update_game";
  const data = {
    userId,
    quizId,
    quizName,
    questions
  };
  return post(ep, data, {}, true);
}

export function deleteGame(userId, gameId) {
  const ep = "quiz";
  const params = { id: `eq.${gameId}`, creator: `eq.${userId}` };
  return del(ep, params);
}

export function getHostGames(userId) {
  const ep = "quiz";
  const params = {
    creator: `eq.${userId}`,
    select: "quizId:id,quizName:name,quizRounds:quiz_round(roundNo:round_no,roundId:id,questions:question(questionId:id,question,answers:answer(answerId:id,answer,points)))"
  };
  return get(ep, params);
}

export function getGameId(code) {
  const ep = "game";
  const params = {
    code: `eq.${code}`,
    select: "id"
  };
  return get(ep, params, true);
}

export function joinGame(userId, code) {
  return getGameId(code)
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error("Invalid game code");
      }
    })
    .then(({ id }) => {
      const ep = "game_participant";
      const data = {
        game_id: id,
        player_id: userId
      };
      const params = {
        select: "participantId:id,game(quiz(name,quizRounds:quiz_round(roundNo:round_no,questions:question(questionNo:question_no,questionId:id,answers:answer(answerId:id)))))"
      };
      return post(ep, data, params, false, true);
    });
}

export function createHostedGame(userId, gameId) {
  const ep = "rpc/host_game";
  const data = {
    userId,
    gameId
  };
  return post(ep, data, {}, true);
}

export function getParticipants(code) {
  const ep = "game";
  const params = {
    code: `eq.${code}`,
    select: "participants:game_participant(player(displayName:display_name))"
  };
  return get(ep, params, true);
}

export function getParticipantAnswers(code) {
  const ep = "game";
  const params = {
    code: `eq.${code}`,
    select: "participants:game_participant(id,responses:participant_response(response,answer(answerId:id,points,answer,question(questionId:id,questionNo:question_no,question,round(roundNo:round_no)))))",
    "round.order": "round_no.asc",
    "question.order": "question_no.asc"
  };
  return get(ep, params);
}

export function submitScore(participantId, score) {
  const ep = "game_participant";
  const params = {
    id: `eq.${participantId}`
  };
  const data = {
    score
  };
  return patch(ep, params, data);
}
