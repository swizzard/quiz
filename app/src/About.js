import React from 'react';
import { Link, useHistory } from 'react-router-dom';

export function About() {
  const history = useHistory();
  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <h2>About</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <p>
            Created by <a href="https://swizzard.pizza">Sam Raker</a>.
          </p>
          <p>
            <a href="https://github.com/swizzard/quiz">Source</a>
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <button
            className="btn btn-dark btn-sm"
            onClick={() => history.go(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}

export function Help() {
  const history = useHistory();

  return (
    <>
      <div className="row">
        <div className="col-sm-12">
          <h2>Help</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="list-group">
            <div className="list-group-item list-group-item-action">
              <div>
                <h4>Create Or Edit Game</h4>
              </div>
              <p>
                <Link to="/draft">Create a game</Link>, and then add rounds and
                questions to it. You can make the questions as detailed or
                sketchy as you want&mdash;your players won't see them. Add as
                many answers as you want; you can assign different points to
                different answers. You can also go back and edit games you've
                already created, changing question phrasing, adjusting point
                values, or adding new rounds, questions, or answers.
              </p>
            </div>
            <div className="list-group-item list-group-item-action">
              <div>
                <h4>Host Game</h4>
              </div>
              <p>
                When you've finished creating a game or two, you can{' '}
                <Link to="/host">host a game</Link>. You'll be given a link to
                send to people you want to invite to join the game, and can see
                who's joined by clicking the <pre>Refresh Participants</pre>{' '}
                button. Once you've finished playing, you can click{' '}
                <pre>Score Game</pre> to review participants' answers and assign
                points to them. Judge the answers how you want&mdash;you don't
                have to stick with the points you've assigned when you created
                the game, and can assign partial or bonus points. When you're
                done reviewing all your participants' answers, you'll be shown
                the final tallies to share with your grateful players!
              </p>
            </div>
            <div className="list-group-item list-group-item-action">
              <div>
                <h4>Play Game</h4>
              </div>
              <p>
                Use the link you've been sent by your host to join a game. As
                they read each question, type in your answers.{' '}
                <b>TYPE YOUR ANSWERS IN, DON'T SHOUT THEM OUT!</b> (Unless your
                host asks you to.) It's also important that you{' '}
                <b>DON'T REFRESH THE PAGE</b> or you'll have to start over,
                which will be as irritating for you as it is for your host and
                fellow players. When you're done, click{' '}
                <pre>Submit Answers</pre> and wait for your host to give you
                your score.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="btn-group">
          <button
            className="btn btn-dark btn-sm"
            type="button"
            onClick={() => history.go(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}
