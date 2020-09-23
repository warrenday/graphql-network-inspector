import { NetworkRequest } from "../hooks/useNetworkMonitor";
// export const networkRequests: NetworkRequest[] = [
//   {
//     id: "100343",
//     status: 200,
//     url: "https://tomorrow-api.herokuapp.com/graphql",
//     request: {
//       body: JSON.stringify({
//         operationName: "listOccurances",
//         variables: {
//           startDateTime: "2020-09-23T23:00:00.000Z",
//           endDateTime: "2020-09-24T22:59:59.999Z",
//         },
//         query:
//           "query listOccurances($id: GUID, $startDateTime: DateTime!, $endDateTime: DateTime!) {\n  listOccurances(id: $id, range: {startDateTime: $startDateTime, endDateTime: $endDateTime}) {\n    id\n    parentId\n    id\n    title\n    description\n    duration\n    price\n    date\n    createdAt\n    cancelled\n    totalBookings\n    spaces\n    filters {\n      id\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}\n",
//       }),
//       headers: [{ name: "some-header", value: "hello" }],
//     },
//     response: {
//       headers: [{ name: "Connection", value: "keep-alive" }],
//       body: `{"data":{"listOccurances":[{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T08:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","parentId":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","title":"Circuit Training","description":"Circuit training is one of the most efficient forms of exercise to burn fat, lose weight, and build muscle. This class is seriously intense.","duration":1,"price":1000,"date":"2020-09-24T16:00:00.000Z","createdAt":"1588099052216","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"c7b1330d-d727-4ea9-8fba-924fc06b7e15","name":"Core","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"e449e1c3-248a-47b2-9410-6b67642e614e","name":"Alex","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T17:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","parentId":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","title":"Yoga","description":"Need to de-stress, stretch out or get zen. We run multiple classes per week to help you take a break from the city. Mats are provided, or you can bring your own.","duration":1,"price":1000,"date":"2020-09-24T18:00:00.000Z","createdAt":"1588099274081","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"60cc3cb7-02ad-4acb-8539-7dae124ad30f","name":"Mindfulness","type":"TAG","__typename":"Filter"},{"id":"dd210a0f-3f27-4f3b-a069-19e08c35e6b4","name":"Lizzie","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"}]}}`,
//     },
//   },
//   {
//     id: "100344",
//     status: 200,
//     url: "https://tomorrow-api.herokuapp.com/graphql",
//     request: {
//       body: JSON.stringify({
//         operationName: "listOccurances",
//         variables: {
//           startDateTime: "2020-09-23T23:00:00.000Z",
//           endDateTime: "2020-09-24T22:59:59.999Z",
//         },
//         query:
//           "query listOccurances($id: GUID, $startDateTime: DateTime!, $endDateTime: DateTime!) {\n  listOccurances(id: $id, range: {startDateTime: $startDateTime, endDateTime: $endDateTime}) {\n    id\n    parentId\n    id\n    title\n    description\n    duration\n    price\n    date\n    createdAt\n    cancelled\n    totalBookings\n    spaces\n    filters {\n      id\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}\n",
//       }),
//       headers: [{ name: "some-header", value: "hello" }],
//     },
//     response: {
//       headers: [{ name: "Connection", value: "keep-alive" }],
//       body: `{"data":{"listOccurances":[{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T08:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","parentId":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","title":"Circuit Training","description":"Circuit training is one of the most efficient forms of exercise to burn fat, lose weight, and build muscle. This class is seriously intense.","duration":1,"price":1000,"date":"2020-09-24T16:00:00.000Z","createdAt":"1588099052216","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"c7b1330d-d727-4ea9-8fba-924fc06b7e15","name":"Core","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"e449e1c3-248a-47b2-9410-6b67642e614e","name":"Alex","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T17:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","parentId":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","title":"Yoga","description":"Need to de-stress, stretch out or get zen. We run multiple classes per week to help you take a break from the city. Mats are provided, or you can bring your own.","duration":1,"price":1000,"date":"2020-09-24T18:00:00.000Z","createdAt":"1588099274081","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"60cc3cb7-02ad-4acb-8539-7dae124ad30f","name":"Mindfulness","type":"TAG","__typename":"Filter"},{"id":"dd210a0f-3f27-4f3b-a069-19e08c35e6b4","name":"Lizzie","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"}]}}`,
//     },
//   },
//   {
//     id: "100345",
//     status: 200,
//     url: "https://tomorrow-api.herokuapp.com/graphql",
//     request: {
//       body: JSON.stringify([
//         {
//           operationName: "listOccurances",
//           variables: {
//             startDateTime: "2020-09-23T23:00:00.000Z",
//             endDateTime: "2020-09-24T22:59:59.999Z",
//           },
//           query:
//             "query listOccurances($id: GUID, $startDateTime: DateTime!, $endDateTime: DateTime!) {\n  listOccurances(id: $id, range: {startDateTime: $startDateTime, endDateTime: $endDateTime}) {\n    id\n    parentId\n    id\n    title\n    description\n    duration\n    price\n    date\n    createdAt\n    cancelled\n    totalBookings\n    spaces\n    filters {\n      id\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}\n",
//         },
//       ]),
//       headers: [{ name: "some-header", value: "hello" }],
//     },
//     response: {
//       headers: [{ name: "Connection", value: "keep-alive" }],
//       body: `{"data":{"listOccurances":[{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T08:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","parentId":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","title":"Circuit Training","description":"Circuit training is one of the most efficient forms of exercise to burn fat, lose weight, and build muscle. This class is seriously intense.","duration":1,"price":1000,"date":"2020-09-24T16:00:00.000Z","createdAt":"1588099052216","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"c7b1330d-d727-4ea9-8fba-924fc06b7e15","name":"Core","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"e449e1c3-248a-47b2-9410-6b67642e614e","name":"Alex","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T17:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","parentId":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","title":"Yoga","description":"Need to de-stress, stretch out or get zen. We run multiple classes per week to help you take a break from the city. Mats are provided, or you can bring your own.","duration":1,"price":1000,"date":"2020-09-24T18:00:00.000Z","createdAt":"1588099274081","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"60cc3cb7-02ad-4acb-8539-7dae124ad30f","name":"Mindfulness","type":"TAG","__typename":"Filter"},{"id":"dd210a0f-3f27-4f3b-a069-19e08c35e6b4","name":"Lizzie","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"}]}}`,
//     },
//   },
//   {
//     id: "100346",
//     status: 200,
//     url: "https://tomorrow-api.herokuapp.com/graphql",
//     request: {
//       body: JSON.stringify([
//         {
//           operationName: "listOccurancesLongLong",
//           variables: {
//             startDateTime: "2020-09-23T23:00:00.000Z",
//             endDateTime: "2020-09-24T22:59:59.999Z",
//           },
//           query:
//             "mutation listOccurancesLongLong($id: GUID, $startDateTime: DateTime!, $endDateTime: DateTime!) {\n  listOccurancesLongLong(id: $id, range: {startDateTime: $startDateTime, endDateTime: $endDateTime}) {\n    id\n    parentId\n    id\n    title\n    description\n    duration\n    price\n    date\n    createdAt\n    cancelled\n    totalBookings\n    spaces\n    filters {\n      id\n      name\n      type\n      __typename\n    }\n    __typename\n  }\n}\n",
//         },
//       ]),
//       headers: [{ name: "some-header", value: "hello" }],
//     },
//     response: {
//       headers: [{ name: "Connection", value: "keep-alive" }],
//       body: `{"data":{"listOccurancesLongLong":[{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T08:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","parentId":"ee11db39-5b2a-4f10-a237-3b84cff6c95f","title":"Circuit Training","description":"Circuit training is one of the most efficient forms of exercise to burn fat, lose weight, and build muscle. This class is seriously intense.","duration":1,"price":1000,"date":"2020-09-24T16:00:00.000Z","createdAt":"1588099052216","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"c7b1330d-d727-4ea9-8fba-924fc06b7e15","name":"Core","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"e449e1c3-248a-47b2-9410-6b67642e614e","name":"Alex","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","parentId":"c153ed5e-5aa8-415f-b1b1-c8defa8b4557","title":"Boxing","description":"If you are a beginner or a seasoned pro, we offer classes for a range of abilities. Head over to our gym and try out Boxing with some of the top instructors in the city.","duration":1,"price":1000,"date":"2020-09-24T17:00:00.000Z","createdAt":"1588099320986","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"05962c29-a9a2-4d84-a251-78740887d396","name":"Fitness","type":"TAG","__typename":"Filter"},{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"a596d9b8-7cfe-494f-9fa9-34cd397c43db","name":"MMA","type":"TAG","__typename":"Filter"},{"id":"2fdc9e5a-eff9-42e6-87d2-e543d0f600a1","name":"Peter","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"},{"id":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","parentId":"80b969a3-4f36-4654-9dd2-fb94bfe433bd","title":"Yoga","description":"Need to de-stress, stretch out or get zen. We run multiple classes per week to help you take a break from the city. Mats are provided, or you can bring your own.","duration":1,"price":1000,"date":"2020-09-24T18:00:00.000Z","createdAt":"1588099274081","cancelled":false,"totalBookings":0,"spaces":20,"filters":[{"id":"db21ede7-a7a0-42d1-9ec4-b6935578667d","name":"London","type":"LOCATION","__typename":"Filter"},{"id":"60cc3cb7-02ad-4acb-8539-7dae124ad30f","name":"Mindfulness","type":"TAG","__typename":"Filter"},{"id":"dd210a0f-3f27-4f3b-a069-19e08c35e6b4","name":"Lizzie","type":"HOST","__typename":"Filter"}],"__typename":"Occurance"}]}}`,
//     },
//   },
// ];

export const networkRequests = [];
