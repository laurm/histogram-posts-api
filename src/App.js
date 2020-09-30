import React, { useState, useEffect } from "react";

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";

import "./App.css";

const App = () => {
  const [fetchData, setFetchData] = useState([]);
  const [postsMonths, setPostsMonths] = useState([]);

  const client = new ApolloClient({
    uri: "https://fakerql.stephix.uk/graphql",
    cache: new InMemoryCache(),
  });

  const getMonthFromTimestamp = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleString("default", {
      month: "long",
    });
  };

  useEffect(() => {
    client
      .query({
        query: gql`
          query AllPosts {
            allPosts(count: 200) {
              id
              title
              createdAt
            }
          }
        `,
      })
      .then((result) => {
        setFetchData(result.data.allPosts);
        let arr = result.data.allPosts.map((post) => {
          return getMonthFromTimestamp(post.createdAt);
        });
        setPostsMonths(arr);
      })
      .catch((error) => console.log(`ERROR: ${error}`));
  }, []);

  const getPostsNo = (month) => {
    return postsMonths.filter((item) => item === month).length;
  };

  const graphData = [
    { month: "January", postsNo: getPostsNo("January") },
    { month: "February", postsNo: getPostsNo("February") },
    { month: "March", postsNo: getPostsNo("March") },
    { month: "April", postsNo: getPostsNo("April") },
    { month: "May", postsNo: getPostsNo("May") },
    { month: "June", postsNo: getPostsNo("June") },
    { month: "July", postsNo: getPostsNo("July") },
    { month: "August", postsNo: getPostsNo("August") },
    { month: "September", postsNo: getPostsNo("September") },
    { month: "October", postsNo: getPostsNo("October") },
    { month: "November", postsNo: getPostsNo("November") },
    { month: "December", postsNo: getPostsNo("December") },
  ];

  const data = graphData;

  // Define the graph dimensions and margins
  const width = 500;
  const height = 500;
  const margin = { top: 20, bottom: 20, left: 20, right: 20 };

  // Then we'll create some bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // We'll make some helpers to get at the data we want
  const x = (d) => d.month;
  const y = (d) => +d.postsNo * 100;

  // And then scale the graph by our data
  const xScale = scaleBand({
    range: [0, xMax],
    round: true,
    domain: data.map(x),
    padding: 0.4,
  });
  const yScale = scaleLinear({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map(y))],
  });

  // Compose together the scale and accessor functions to get point functions
  const compose = (scale, accessor) => (data) => scale(accessor(data));
  const xPoint = compose(xScale, x);
  const yPoint = compose(yScale, y);

  // Finally we'll embed it all in an SVG
  const BarGraph = (props) => {
    return (
      <svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = yMax - yPoint(d);
          return (
            <>
              {" "}
              <Group key={`bar-${i}`}>
                <Bar
                  x={xPoint(d)}
                  y={yMax - barHeight}
                  height={barHeight}
                  width={xScale.bandwidth()}
                  fill="#fc2e1c"
                />
              </Group>
            </>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Histogram based on {fetchData.length} posts (randomly) fetched from
          the GraphQL API
        </p>
        <div className="histogram">
          <p>
            <BarGraph />
          </p>
          <ul style={{ listStyle: "none", paddingLeft: "0", margin: "0" }}>
            {postsMonths.length > 0 &&
              graphData.map((item, id) => {
                return (
                  <li key={id}>
                    {item.month} : {item.postsNo} posts
                  </li>
                );
              })}
          </ul>
        </div>
      </header>
    </div>
  );
};

export default App;
