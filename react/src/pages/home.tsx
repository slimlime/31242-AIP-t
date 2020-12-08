import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import "../assets/css/home.css";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Snackbar,
  Divider,
  IconButton,
} from "@material-ui/core";
import { UserContext } from "../components/user-context";
import { AvatarWithMenu } from "../components/avatarWithMenu";
import Leaderboard from "../components/leaderboard";
import { Search, Clear } from "@material-ui/icons";
import RequestComponent from "../components/request";
import { requestsEndpoint, itemEndpoint } from "../api/endpoints";
import { Pagination } from "@material-ui/lab";

type Request = {
  id: string;
  author: {
    username: string;
    display_name: string;
  };
  completed_by: {
    username: string;
    display_name: string;
  };
  proof_of_completion: string; // UUID
  rewards: RewardItem[];
  details: string;
  created_time: string;
  completion_time: string;
  is_completed: boolean;
};

type Item = {
  id: string;
  display_name: string;
};

type RewardItem = {
  id: string;
  giver: { username: string; display_name: string };
  item: { id: string; display_name: string };
};

type HomeState = {
  filterKey: string;
  filterValue: string;
  snack: boolean;
  snackMessage: string;
  requests: Request[];
  rewards: Item[];
  pageNumber: number;
};

const numberOfItemsPerPage = 5;

class Home extends React.Component<RouteComponentProps, HomeState> {
  private loadingRef: React.RefObject<HTMLInputElement>;

  constructor(props: RouteComponentProps) {
    super(props);

    this.loadingRef = React.createRef();
  }
  state: HomeState = {
    filterKey: "Keyword",
    filterValue: "",
    snack: false,
    snackMessage: "",
    requests: [],
    rewards: [],
    pageNumber: 1,
  };

  static contextType = UserContext;

  // Toggle loading circle for when async fetching
  setLoading(value: boolean): void {
    this.loadingRef.current!.style.display = value ? "block" : "none";
  }

  // Made into an arrow function to pass down to child componenents for auto-refreshing functionality
  fetchFilter = () => {
    if (this.state.filterKey && this.state.filterValue) {
      this.setLoading(true);
      this.setState({ requests: [] });
      let url = new URL("/api/requests", document.baseURI);
      // Check whether filtering by keyword or reward and apply to fetch query accordingly
      let params: any =
        this.state.filterKey === "Keyword"
          ? { search: this.state.filterValue }
          : { reward: this.state.filterValue };
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );
      fetch(url.href, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            // Successful login 200
            res.json().then((body) => {
              console.log("Success:", body);
              this.setState({
                snackMessage: "Fetched filtered requests!",
                snack: true,
                requests: body,
              });
              this.setLoading(false);
            });
          } else {
            res.json().then((body) => {
              console.log(body.errors);
              this.setState({ snackMessage: body.errors, snack: true });
              this.setLoading(false);
            });
          }
        })
        .catch((exception) => {
          console.error("Error:", exception);
          this.setState({ snackMessage: `${exception}` });
          this.setState({ snack: true });
          this.setLoading(false);
        });
    } else {
      // Else fetch all requests if no input for filter entered
      this.fetchRequests();
    }
  };

  fetchRequests(): void {
    this.setLoading(true);
    this.setState({ requests: [] });
    fetch(`${requestsEndpoint}`, {
      method: "GET",
    })
      .then((res) => {
        if (res.status === 200) {
          // Successful login 200
          res.json().then((body) => {
            this.setState({ requests: body });
            console.log("requests " + JSON.stringify(body));
            this.setLoading(false);
          });
        } else {
          res.json().then((body) => {
            console.log(body.errors);
            this.setState({ snackMessage: body.errors, snack: true });
            this.setLoading(false);
          });
        }
      })
      .catch((exception) => {
        console.error("Error:", exception);
        this.setState({ snackMessage: `${exception}` });
        this.setState({ snack: true });
        this.setLoading(false);
      });
  }

  fetchItems(): void {
    fetch(`${itemEndpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          // Successful login 200
          res.json().then((body) => this.setState({ rewards: body }));
        }
      })
      .catch((exception) => {
        console.error("Error:", exception);
        this.setState({ snackMessage: `${exception}` });
        this.setState({ snack: true });
      });
  }

  componentDidMount() {
    // Fetch requests and items on load
    this.fetchRequests();
    this.fetchItems();
  }

  // Calculate the number of pages required to hold the requests on home with numberOfItemsPerPage per page
  setCountOfRequest(): number {
    if (this.state.requests.length % numberOfItemsPerPage !== 0) {
      return Math.ceil(this.state.requests.length / numberOfItemsPerPage);
    } else {
      return this.state.requests.length / numberOfItemsPerPage;
    }
  }

  render() {
    return (
      <Container component="main" maxWidth="lg">
        <div className="paper">
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <div id="header">
                <Link to="/home">
                  <img
                    width="120"
                    height="80"
                    alt="IOU Logo"
                    src={process.env.PUBLIC_URL + "/iou-logo.png"}
                  />
                </Link>
                <Typography component="h1" variant="h4">
                  {"Home"}
                </Typography>
                <AvatarWithMenu />
              </div>
            </Grid>
            <Grid item xs={8}>
              <Paper elevation={3} className="content">
                <Typography component="h3" variant="h4">
                  {"Requests"}
                </Typography>
                <Box id="filterContainer" display="inline">
                  <Box>
                    <TextField
                      id="filter-menu"
                      select
                      label="Filter by:"
                      variant="outlined"
                      value={this.state.filterKey}
                      onChange={(e) => {
                        this.setState({
                          filterKey: e.target.value as string,
                        });
                      }}
                    >
                      <MenuItem value={"Keyword"}>Keyword</MenuItem>
                      <MenuItem value={"Reward"}>Reward</MenuItem>
                    </TextField>
                  </Box>
                  <Box pl={4}>
                    {this.state.filterKey === "Reward" && (
                      <TextField
                        id="filter-dropdown"
                        size="medium"
                        select
                        value={this.state.filterValue}
                        onChange={(e) => {
                          this.setState({
                            filterValue: e.target.value as string,
                          });
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search id="search-icon" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {this.state.rewards.map((rewardItem, i) => {
                          return (
                            <MenuItem key={i + 1} value={rewardItem.id}>
                              {rewardItem.display_name}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    )}
                    {!(this.state.filterKey === "Reward") && (
                      <TextField
                        size="medium"
                        onChange={(e) =>
                          this.setState({ filterValue: e.target.value })
                        }
                        value={this.state.filterValue}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search id="search-icon" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Button
                      id="filter-button"
                      size="large"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        this.fetchFilter();
                      }}
                    >
                      <label>Filter</label>
                    </Button>
                  </Box>
                  <IconButton
                    id="clear-button"
                    onClick={() => {
                      this.setState({
                        filterValue: "",
                        filterKey: "",
                        snack: true,
                        snackMessage: "Cleared filter!",
                      });
                    }}
                  >
                    <Clear id="clear-icon" />
                  </IconButton>
                </Box>
                <Box width="90%" mt={3}>
                  <Grid
                    container
                    direction="column"
                    justify="space-evenly"
                    spacing={3}
                  >
                    <Grid item xs={12}>
                      <Grid container direction="row">
                        <Grid id="headerItem" item xs={3}>
                          <Typography variant="h6">Favour</Typography>
                        </Grid>
                        <Grid id="headerItem" item xs={3}>
                          <Typography variant="h6">Task</Typography>
                        </Grid>
                        <Grid id="headerItem" item xs={2}>
                          <Typography variant="h6">Proof</Typography>
                        </Grid>
                        <Grid id="headerItem" item xs={3}>
                          <Typography variant="h6">Completed</Typography>
                        </Grid>
                        <Grid id="headerItem" item xs={1}>
                          <Typography variant="h6">Info</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Divider variant="middle" />
                    {this.state.requests
                      .slice(
                        (this.state.pageNumber - 1) * numberOfItemsPerPage,
                        this.state.pageNumber * numberOfItemsPerPage
                      )
                      .map((requestProp, i) => {
                        return (
                          <Grid item xs={12}>
                            <RequestComponent
                              key={i}
                              request={requestProp}
                              potentialRewards={this.state.rewards}
                              iouType={2}
                              refreshTable={this.fetchFilter}
                            />
                          </Grid>
                        );
                      })}
                  </Grid>
                  <CircularProgress
                    ref={this.loadingRef}
                    size={35}
                    color="inherit"
                    id="homeLoading"
                  />
                  <Divider variant="middle" />
                  <Pagination
                    id="homePagination"
                    count={this.setCountOfRequest()}
                    page={this.state.pageNumber}
                    onChange={(
                      event: React.ChangeEvent<unknown>,
                      value: number
                    ) => {
                      this.setState({ pageNumber: value });
                    }}
                    defaultPage={1}
                    siblingCount={0}
                    color="primary"
                  />
                </Box>
                <Snackbar
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  message={this.state.snackMessage}
                  open={this.state.snack}
                  onClose={() => {
                    this.setState({ snack: false });
                  }}
                  autoHideDuration={5000}
                />
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Leaderboard />
            </Grid>
          </Grid>
        </div>
      </Container>
    );
  }
}

export default Home;
