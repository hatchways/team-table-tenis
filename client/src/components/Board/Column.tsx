import { Button, Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import useStyles from './useStyles';
import Task from './Task';
import { Column as ColumnInterface } from '../../interface/Column';
import { Task as TaskInterface, TaskPlaceHolder } from '../../interface/Task';
import { useState } from 'react';
export interface properties {
  placeHolderStyle: TaskPlaceHolder;
  Column: ColumnInterface;
  index: number;
  Tasks: TaskInterface[];
}

const Column: React.FunctionComponent<properties> = (props) => {
  const [state, setState] = useState({ placeHolderStyle: props.placeHolderStyle, visable: -1, dragFinished: true });
  const classes = useStyles();
  const setVisable = (zAxis: number) => {
    const newState = state;
    newState.visable = zAxis;
    setState(newState);
  };
  const onMouseEnter = () => {
    setVisable(1);
  };
  const onMouseLeave = () => {
    setVisable(-1);
  };
  const onMouseUp = () => {
    setVisable(-1);
  };

  return (
    <Draggable draggableId={props.Column.Id} index={props.index}>
      {(provided) => (
        <Card
          className={classes.column}
          {...provided.draggableProps}
          ref={provided.innerRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
        >
          <CardHeader
            title={props.Column.Title}
            titleTypographyProps={{ variant: 'h5' }}
            className={classes.columnTitle}
            {...provided.dragHandleProps}
          ></CardHeader>
          <Droppable droppableId={props.Column.Id} type="task">
            {(provided) => (
              <CardContent ref={provided.innerRef} {...provided.droppableProps}>
                {props.Tasks.map((task: TaskInterface, index: number) => (
                  <Task key={task.Id} task={task} index={index}></Task>
                ))}
                {provided.placeholder}
                <div
                  style={{
                    top: props.placeHolderStyle.clientY,
                    height: props.placeHolderStyle.clientHeight,
                    width: props.placeHolderStyle.clientWidth,
                    position: 'absolute',
                    zIndex: state.visable,
                  }}
                >
                  <Card
                    elevation={0}
                    style={{
                      top: props.placeHolderStyle.clientY,
                      left: props.placeHolderStyle.clientX,
                      height: props.placeHolderStyle.clientHeight,
                      width: props.placeHolderStyle.clientWidth,
                      position: 'static',
                      zIndex: state.visable,
                      backgroundColor: '#E5ECFC',
                    }}
                  ></Card>
                </div>
              </CardContent>
            )}
          </Droppable>
          <CardActions>
            <Button
              variant="contained"
              style={{ marginLeft: 10, marginBottom: 10, zIndex: 2, backgroundColor: '#759CFC', color: 'white' }}
            >
              Add a card
            </Button>
          </CardActions>
        </Card>
      )}
    </Draggable>
  );
};

export default Column;
