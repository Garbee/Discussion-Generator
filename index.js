import { Octokit, App } from "octokit";
import { graphql } from "@octokit/graphql";
import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill';
import * as dotenv from 'dotenv';
Date.prototype.toTemporalInstant = toTemporalInstant;
dotenv.config();

const authToken = process.env.TOKEN;
const org = process.env.ORGANIZATION;
const repositoryName = process.env.REPOSITORY;
const categorySlug = process.env.SLUG;
const cal = Temporal.Calendar.from('iso8601');
const currentDate = Temporal.Now.plainDate(cal);
const currentDayOfWeek = currentDate.dayOfWeek;
const daysToFill = [];
let startDate;

if (currentDayOfWeek === 1) {
  startDate = currentDate.add({ days: 7 });
} else {
  let workingDate = currentDate;

  while(startDate === undefined) {
    workingDate = workingDate.add({days: 1});

    if (workingDate.dayOfWeek === 1) {
      startDate = workingDate;
    }
  }
}

const locale = 'en-US';
const dateOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

daysToFill.push(startDate.toLocaleString(locale, dateOptions));

let i = 4;
let curr = startDate;

while (i !== 0) {
  curr = curr.add({days: 1});
  daysToFill.push(curr.toLocaleString(locale, dateOptions));
  i--;
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `bearer ${authToken}`,
  },
});


const discussionBody = '# Agenda\n\n- [ ] Thing to discuss from an async thread\n\n# Actions\n\n - [ ] {person} {action}\n';

const { repository } = await graphqlWithAuth(`
  {
    repository(owner: "${org}", name: "${repositoryName}") {
      id,
      discussionCategory(slug: "${categorySlug}") {
        id,
        name,
      }
    }
  }
`);

const repoId = repository.id;
const discussionCategoryId = repository.discussionCategory.id;

for(const meetingDate of daysToFill) {
  await graphqlWithAuth(`
    mutation {
      createDiscussion(input: {
        repositoryId: "${repoId}",
        categoryId: "${discussionCategoryId}",
        title: "${meetingDate}",
        body: "${discussionBody}",
      }) {
        discussion {
          id
        }
      }
    }
  `);
}

console.log('Created meeting entries');
