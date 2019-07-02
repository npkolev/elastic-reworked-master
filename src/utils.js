// Buid the elastic query with the query object and filters passed in
export const buildQuery = (query, filterProps) => {
    return {
      size: 10,
      from: 0,
      query: {
        query_string: {
          query: query
        }
      },
      highlight: {
        fields: {
          "*": {}
        },
        number_of_fragments: 0,
        tags_schema: "styled"
      },
      ...filterProps
    };
  }