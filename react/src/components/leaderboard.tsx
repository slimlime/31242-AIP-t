import React from "react";
import "../assets/css/leaderboard.css";
import {
  leaderboardAllEndpoint,
  leaderboardMeEndpoint,
} from "../api/endpoints";
import {
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import LeaderboardUser from "./leaderboardUser";
import { UserContext } from "./user-context";
import { Redirect } from "react-router-dom";

type LeaderboardUser = {
  rank: number;
  username: string;
  score: number;
};

type LeaderboardState = {
  users: LeaderboardUser[];
  me: {
    rank: number;
    score: number;
  };
  showMe: boolean;
  error: string;
  pageNumber: number;
  unauthRep: boolean;
};

type LeaderboardProps = {};

const numberOfItemsPerPage = 3;

class Leaderboard extends React.Component<LeaderboardProps, LeaderboardState> {
  private loadingRef: React.RefObject<HTMLInputElement>;

  constructor(props: LeaderboardProps) {
    super(props);

    this.loadingRef = React.createRef();
  }

  state: LeaderboardState = {
    users: [],
    error: "",
    me: { rank: -1, score: -1 },
    showMe: false,
    pageNumber: 1,
    unauthRep: false,
  };

  componentDidMount() {
    this.fetchAllLeaderboard();
    this.fetchMeLeaderboardIfNeeded();
  }

  static contextType = UserContext;

  // Determine whether user is logged in and fetch personal score if needed
  fetchMeLeaderboardIfNeeded = () => {
    if (this.context.user.name !== "?") {
      this.fetchMeLeaderboard();
    }
  };

  // Toggle loading circle for when async fetching
  setLoading(value: boolean): void {
    if (!this.loadingRef && !(this.loadingRef as any).current) {
      (this.loadingRef as any).current!.style.display = value
        ? "block"
        : "none";
    }
  }

  // Calculate the number of pages required to hold the users on the leaderboard with numberOfItemsPerPage per page
  setCountOfLeaderboard(): number {
    if (this.state.users.length % numberOfItemsPerPage !== 0) {
      return Math.ceil(this.state.users.length / numberOfItemsPerPage);
    } else {
      return this.state.users.length / numberOfItemsPerPage;
    }
  }

  // Fetch all the users on the leaderboard
  fetchAllLeaderboard() {
    this.setLoading(true);
    fetch(`${leaderboardAllEndpoint}`, {
      method: "GET",
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            this.setState({ users: body });
            this.setState({ error: "" });
            this.setLoading(false);
          });
        } else if (res.status === 401) {
          this.setState({ unauthRep: true });
          this.setLoading(false);
        }
      })
      .catch((exception) => {
        console.error("Error:", exception);
        this.setState({ error: exception });
        this.setLoading(false);
      });
  }

  // Fetch personal score and rank for leaderboard
  fetchMeLeaderboard() {
    fetch(`${leaderboardMeEndpoint}`, {
      method: "GET",
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((body) => {
            this.setState({ me: body }, () => {
              this.setState({ showMe: true });
            });
            this.setState({ error: "" });
            console.log("Success:", body);
          });
        } else if (res.status === 401) {
          this.setState({ unauthRep: true });
          this.setLoading(false);
        } else {
          res.json().then((body) => {
            console.error("Error:", body.errors);
            this.setState({ error: body.errors });
          });
        }
      })
      .catch((exception) => {
        console.log("Error:", exception);
      });
  }

  render() {
    // If unauthorised response (e.g. expired token), redirect to login
    if (this.state.unauthRep) {
      return (
        <Redirect
          to={{
            pathname: "/login",
            state: {
              unauthenticated:
                "Your session has expired! Please sign in again :)",
            },
          }}
        />
      );
    }

    return (
      <Paper elevation={3} className="content">
        <Container id="leaderboardContainer" component="main" maxWidth="lg">
          <Typography id="leaderboardHeader" component="h3" variant="h4">
            {"Leaderboard"}
          </Typography>
          <Grid
            container
            direction="column"
            justify="space-between"
            spacing={1}
          >
            <Grid item xs={12}>
              <Grid container direction="row">
                <Grid id="leaderboardItem" item xs={2}>
                  <Typography variant="subtitle1">Rank</Typography>
                </Grid>
                <Grid id="leaderboardItem" item xs={5}>
                  <Typography variant="subtitle1">Username</Typography>
                </Grid>
                <Grid id="leaderboardItem" item xs={2}>
                  <Typography variant="subtitle1">Score</Typography>
                </Grid>
                <Grid id="leaderboardItem" item xs={3}>
                  <Typography variant="subtitle1">Avatar</Typography>
                </Grid>
              </Grid>
            </Grid>
            <CircularProgress
              ref={this.loadingRef}
              size={35}
              color="inherit"
              id="leaderboardLoading"
            />
            {this.state.error}
            {/* kudos to
            https://stackoverflow.com/questions/61774099/how-to-add-pagination-to-a-long-list-using-react-materialui */}
            {this.state.users
              .slice(
                (this.state.pageNumber - 1) * numberOfItemsPerPage,
                this.state.pageNumber * numberOfItemsPerPage
              )
              .map((user, i) => {
                return (
                  <Grid item xs={12}>
                    <LeaderboardUser
                      key={i}
                      rank={user.rank}
                      username={user.username}
                      score={user.score}
                    />
                  </Grid>
                );
              })}
          </Grid>
          <Pagination
            id="pagination"
            count={this.setCountOfLeaderboard()}
            page={this.state.pageNumber}
            onChange={(event: React.ChangeEvent<unknown>, value: number) => {
              this.setState({ pageNumber: value });
            }}
            defaultPage={1}
            siblingCount={0}
            color="primary"
          />
          <Divider variant="middle" />
          {this.state.showMe && (
            <div id="meScore">
              <Typography variant="h6">
                And you are rank {this.state.me?.rank} with a score of{" "}
                {this.state.me?.score}!
              </Typography>
              <img
                alt="Raising hands"
                width="40"
                height="40"
                src={process.env.PUBLIC_URL + "/raising-hands.png"}
              />
              <img
                alt="Party popper"
                width="40"
                height="40"
                src={process.env.PUBLIC_URL + "/party-popper.png"}
              />
            </div>
          )}
        </Container>
      </Paper>
    );
  }
}

export default Leaderboard;
