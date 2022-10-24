// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let BASE_URL= "https://jservice.io/"

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

 async function getCategoryIds() {
    console.debug('getCategoryIds function ran')
    
    let res = await axios.get(`${BASE_URL}api/categories?count=100`)
    
    let newResData = res.data.filter((val) => val["clues_count"]>= 5)

    
    let NUM_CATEGORIES = _.sampleSize(newResData, [n = 6]);

    let catId=[]
    for (let num of NUM_CATEGORIES) {
        let categoryID = num.id;
        catId.push(categoryID); 
    }
    console.log("catId:", catId)
    return catId;
    
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
    console.debug('getCategory function ran')

    for (id of catId){
    let {data} = await axios.get(`https://jservice.io/api/category?id=${id}`)
    
    //created clues object for questions and answers.
    let clues = _.sampleSize(data.clues, [n = 5])
    console.log("clues", clues)
    let clueArray =[]

    clues.forEach(e=> {
        clueArray.push({questionId:e.id,
                    answer:e.answer,
                    question:e.question,
                    showing:null})
    }
)

    categories.push({categoryId:data.id,
                    title:data.title,
                    clues:clueArray
    })
    }
    console.log("categories", categories)

    return categories
}


/** Filling the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> is filled w/a <tr>, and a <td> for each category
 * - The <tbody> is filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 */


async function fillTable() {
    console.debug('fillTable Ran')

    categories.forEach(category => { $('thead tr').append(`<th scope="col"> ${category.title}</th>`) })

    for (let i = 0; i < 5; i++) {
        $("tbody").append(`<tr> </tr>`);

        for (let j = 0; j < 6; j++) {
          $("tbody tr").last().append(`<td id="${j}-${i}">?</td>`);
        }
    }
        
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

 function handleClick(evt) {

    console.log(evt);
    let j = parseInt(evt.getAttribute("id")[0]);
    let i = parseInt(evt.getAttribute("id")[2]);
    console.log(j, i);

    if (evt.innerText === "?") { 
      evt.innerHTML = `${categories[j].clues[i].question}`;
    } else if (evt.innerText === `${categories[j].clues[i].question}`) {
      evt.innerHTML = `${categories[j].clues[i].answer}`;
    } else {
      return;
    }
  }

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('.container').empty()

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */


async function setupAndStart() {
    let catId = await getCategoryIds();
    await getCategory(catId);
    $(".container").prepend( 
      $(`<table id="table" class="table table-bordered text-center">
      <thead>
      <tr>
      </tr>
      </thead>
      <tbody>
      </tbody>
      </table>
      `),

      $(document.createElement("button")).prop({
        type: "button",
        innerHTML: "Restart Game",
        class: "btn btn-styled",
      }),
    );
  
    fillTable();
    
    $("td").on("click", function (e) {
      handleClick(e.target);
    });
    $(".btn").on("click", function () {
      location.reload();
    });
  }


setupAndStart()

