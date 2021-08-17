const asyncHandler = require("express-async-handler");
const Board = require('../models/Board');
const Card = require('../models/Card');
const Column = require('../models/Column');


exports.createBoard = asyncHandler(async (req, res, next) => {  
  const { title } = req.body;
  if (title) {
    const inProgress = new Column({ title: 'In Progress' });
    const completed = new Column({ title : 'Completed' }); 
    
    await inProgress.save();
    await completed.save();

    const board = new Board({ title, columns: [inProgress._id, completed._id]});
    await board.save();

    res.status(201).json({
      success: {
        board
      }
    });
  } else {
    res.status(400).send({
      message: 'Board title is empty'
    });
  }
})

exports.getBoard = asyncHandler(async (req, res) => {
  const boardId  = req.params.boardId;

  const board = await Board.findById(boardId);
  if (board) {
    res.status(200).json({ board });
  } else {
    const error = new Error(`Could not find board ${boardId}`);
    res.status(404).json({
      error
    })
  }
})

exports.getBoardFull = asyncHandler(async (req, res) => {
  const boardId  = req.params.boardId;
  

  const board = await Board.findById(boardId);
  /*const columns = await Promise.all(board.columns.map(async (id) => {
    let column = {};
    const doc = await Column.findById(id);
    column[doc._id] = doc;
    return column;
  }));
  */
 const columns = await getColumsAsObject(board);


  const cards = await getCardsColums(board, columns);
  /*await Promise.all (columns.map( async column => {
    console.log("cards");

    cards = await Promise.all( (column.cards.map(async (id) => {
    console.log("col: " + id);

      const doc = await Card.findById(id);
      console.log("doc: " + doc)
      cards[doc._id] = doc;

    })));

    console.log("card" + cards);

  }));
  */



  if (board && columns && cards) {
    res.status(200).json({ board, columns, cards });

  } else {
    const error = new Error(`Could not find board ${boardId}`);
    res.status(404).json({
      error
    })
  }
})






exports.createColumn = asyncHandler(async (req, res) => {
  const { title, boardId } = req.body;
  if (title && boardId) {
    const column = new Column({ title });
    await column.save();
    
    // Add column to board.
    const board = await Board.findById(boardId);
    board.columns.push(column._id);
    await board.save();
    res.status(201).json({
      column
    });
  } else {
    res.status(400).send({
      message: 'Column title is empty'
    });
  }
})

exports.getColumns = asyncHandler(async (req, res) => {
  const  boardId  = req.params.boardId;
  const board = await Board.findById(boardId);
  const columns = await Promise.all(board.columns.map(async (id) => {
    const doc = await Column.findById(id);
    return doc;
  }));
  res.status(200).json({
    columns
  })
})

exports.updateColumn = asyncHandler(async (req, res) => {
  const { id, title, cards } = req.body;
  const filter = { _id : id };
  const update = { title, cards };
  await Column.findOneAndUpdate(filter, update);
  res.status(200);
})

exports.createCard = asyncHandler(async (req, res) => {
  const { title, description, columnId } = req.body;
  const card = new Card({ title });
  if (description) {
    card.description = description;
  }
  card.cardDetails.color = "#FFFFFF";
  await card.save();

  const column = await Column.findById(columnId);
  column.cards.push(card._id);
  await column.save();
  res.status(201).json({
    cardId: card._id
  })
})

getCardsColums = asyncHandler(async (board, columns) => {
  let cards = {};
  //console.log(columns);
  for(const columnId of board.columns){
    const column = columns[columnId];
    for(const cardId of column.cards){
      const card = await Card.findById(cardId);
      cards[card._id] = card;
    }
  }
  

  return cards;
})

getColumsAsObject = asyncHandler(async (board) => {
  let columns = {};
  for(const columnId of board.columns){
    const column = await Column.findById(columnId);
    columns[column._id] = column;
  }
  

  return columns;
})

exports.moveColumn = asyncHandler(async (req, res) => {
  const { boardId, sourceColumnIndex, destColumnIndex, draggableId } = req.body;
  const board = await Board.findById(boardId);
  const newOrder = board.columns;
  newOrder[sourceColumnIndex] = newOrder[destColumnIndex] ;  
  newOrder[destColumnIndex] = draggableId,
  board.columns = newOrder;

  result = await Board.findByIdAndUpdate(boardId, board);
  if(result){
    res.status(200).json({
      result
    })
  }

});


exports.getCards = asyncHandler(async (req, res) => {
  const  columnId  = req.params.columnId;
  const column = await Column.findById(columnId);
  const cards = await Promise.all(column.cards.map(async (id) => {
    const doc = await Card.findById(id);
    return doc;
  }));
  res.status(200).json({
    cards
  })
})

exports.GetCardsFromColumnId = asyncHandler(async (req, res) => {
  const ColumnId  = req.body;

  const cards = await Promise.all(getC.map(async (id) => {
  const doc = await Card.findById(id);
  return doc;
  }));
  res.status(200).json({
    cards
  })
})

exports.getCard = asyncHandler(async (req, res) => {
  const { cardId } = req.body;

  const card = await Card.findById(cardId);
  if(card){
  res.status(200).json({
    card
  })
}
 else {
  const error = new Error(`Could not find card ${cardId}`);
  res.status(404).json({
    error
  })
}
})



exports.moveCard = asyncHandler(async (req, res) => {
  const { ogColId, destColId, row, cardId } = req.body;
  const ogCol = await Column.findOne({ _id: ogColId });
  ogCol.cards = ogCol.cards.filter(id => id.toString() !== cardId);
  await ogCol.save();
  // TODO: make sure to check element exists to begin with.

  const destCol = await Column.findOne({ _id: destColId });
  destCol.cards.splice(row, 0, cardId);
  await destCol.save();
  res.sendStatus(200);
})

exports.moveCardToAnotherColumn = asyncHandler(async (req, res) => {
  const {sourceColumnId, destinationColumnId, sourceCardArray, destinationCardArray } = req.body;
  const source = await Column.findByIdAndUpdate(sourceColumnId, {cards: sourceCardArray});
  const destination = await Column.findByIdAndUpdate(destinationColumnId, {cards: destinationCardArray});

  if(source && destination){
    res.status(200).json({
      source, destination
    })
  }
})

exports.getDetails = asyncHandler(async (req, res) => {
  const cardId = req.params.cardID;
  const cardDetails = await Card.find({ _id: cardId })
    .populate("cardDetails")
  res.status(200).json({ cardDetails });
})
exports.createDetails = asyncHandler(async (req, res) => {
  const { tags, color, deadLine, attachment, cardId } = req.body;

  await Card.findByIdAndUpdate(
    cardId,
    {
      $push: { 
        tags,
        color,
        deadLine,
        attachment
      }
    },
    {
      new: true
    }
  )
  .exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    }
    else {
      res.status(200).json(result);
    }
  })
})
exports.updateDetails = asyncHandler(async (req, res) => {
  const { tags, color, deadLine, attachment, cardId, title } = req.body;

  await Card.findByIdAndUpdate(
    cardId,
    {
      $set: { 
        tags,
        color,
        title,
        deadLine,
        attachment
      }
    },
    {
      new: true
    }
  )
  .exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  })
})

exports.updateDetailsColor = asyncHandler(async (req, res) => {
  const {color, cardId } = req.body;

  await Card.findByIdAndUpdate(
    cardId,
    {
      $set: { 
        color,
      }
    },
    {
      new: true
    }
  )
  .exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.status(200).json(result);
    }
  })
})