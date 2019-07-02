import React, { PureComponent, Fragment } from "react";
import { react as autoBind } from "auto-bind";

import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import Pagination from "./components/Pagination";
import SearchInput from "./components/SearchInput";
import CardResult from "./components/CardResult";
import { getQuery } from './api/getQuery';
import { buildQuery } from './utils';
import "./index.css";

class App extends PureComponent {
  state = {
    results: {},
    value: "",
    page: 0,
    currentPage: 0,
    rowsPerPage: 10,
    lastScore: "",
    lastId: ""
  };

  constructor(props) {
    super(props);
    autoBind(this);
  }

  // Make API call to the Elastic db and pass the complete query object
  async baseQuery(query) {
    const filterProps = {
      sort: [{ _score: "desc" }, { _id: "desc" }]
    }
    // Buid the elastic query with the query object and filters passed in
    const queryObj = buildQuery(query, filterProps);
    const data = await getQuery(queryObj);
    // Save the query results to the local state
    this.setState({ results: data });
  }

  // Trigger API call and state update when the user types into search box
  triggerSearch({ target: { value } }) {
    this.baseQuery(value);
    this.setState({
      value: value
    });
  }

  // When page is changed fetch the required results based on the id of the last entry
  async handleChangePage(e, page) {
    const { currentPage, value, results: { hits: { hits = {} } } = {} } = this.state;
    const pageNumber = currentPage < page;

    if (currentPage === page) {
      this.setState({ page });
      this.baseQuery(value);
    }

    // Display results when Next button is clicked. the next 10 entries after the specified id will be returned
    const searchAfterNext = hits[hits.length - 1]
      ? hits[hits.length - 1].sort
      : [];

    // Display results when Prev button is clicked. Using reverse is problematic, needs fixing
    const reversedHits = !pageNumber && hits.reverse();
    const searchAfterPrev =
      !pageNumber && reversedHits[0] ? reversedHits[0].sort : [];
    // Define filter properties to be passed with the query
    const filterProps = {
      search_after: pageNumber ? searchAfterNext : searchAfterPrev,
      sort: [
        { _score: pageNumber ? "desc" : "asc" },
        { _id: pageNumber ? "desc" : "asc" }
      ]
    }
    // Buid the elastic query with the query object and filters passed in
    const query = buildQuery(value, filterProps);
    const data = await getQuery(query);
    this.setState({ page: page, currentPage: page, results: data });
  }

  // Set the input field and local state value to empty on click of Clear button
  clearInput() {
    this.setState({
      value: "",
      results: {}
    });
  }

  render() {
    const { value, results: { hits } = {} } = this.state;

    return (
      <Fragment>
        <div className="root">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" color="inherit">
                Search App
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <Grid container className="root">
          <Grid className="grid-padding" item xs={12}>
            <Grid
              container
              spacing={16}
              className="demo"
              alignItems="center"
              direction="column"
              justify="center"
            >
              <Paper className="search-root" elevation={1}>
                <SearchInput triggerSearch={this.triggerSearch} value={value} />
                <IconButton className="icon-button" aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </Paper>
              <Button
                variant="contained"
                color="primary"
                onClick={this.clearInput}
              >
                Clear
              </Button>
            </Grid>
            <Grid
              container
              spacing={16}
              alignItems="stretch"
              direction="column"
              justify="center"
            >
              {hits && hits.hits.map( // Map through the hits array and generate cards with search result entries
                ({
                  _id,
                  _source,
                  highlight
                }) => <CardResult key={_id} _source={_source} highlight={highlight} />
              )
              }
              <Grid
                container
                spacing={16}
                alignItems="stretch"
                direction="row"
                justify="center"
              >
                {hits && hits.total > 0 && (
                  <Pagination {...this.state} handleChangePage={this.handleChangePage} />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default App;