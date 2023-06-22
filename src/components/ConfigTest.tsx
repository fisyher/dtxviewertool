import { Box, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useState } from "react";
import { DragDropContext, Draggable, DropResult, DraggingStyle, NotDraggingStyle } from "react-beautiful-dnd";
import { StrictModeDroppable } from "./StrictModeDroppable";

// ドラッグ&ドロップした要素を入れ替える
const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };
  
  // ドラッグ&ドロップの質問のスタイル
  const getItemStyle = (isDragging : boolean, draggableStyle : DraggingStyle | NotDraggingStyle | undefined) => ({
    background: isDragging ? "#757ce8" : "white",
    ...draggableStyle
  });
  // ドラッグ&ドロップのリストのスタイル
  // const getListStyle = (isDraggingOver) => ({
  //   background: isDraggingOver ? "#1769aa" : "lightgrey",
  //   padding: "10px"
  // });

interface TestDataType {
    id: number;
    title: string;
}

const ConfigTest = () => {
    const [questions, setQuestions] = useState<TestDataType[]>([
        { id: 1, title: "question1" },
        { id: 2, title: "question2" },
        { id: 3, title: "question3" },
        { id: 4, title: "question4" },
        { id: 5, title: "question5" }
    ]);

    //result: DropResult, provided: ResponderProvided
    const onDragEnd = (result: DropResult) => {
        // ドロップ先がない
        if (!result.destination) {
          return;
        }
        // 配列の順序を入れ替える
        let movedItems: TestDataType[] = reorder(
          questions, //　順序を入れ変えたい配列
          result.source.index, // 元の配列の位置
          result.destination.index // 移動先の配列の位置
        ) as TestDataType[];
        setQuestions(movedItems);
      };

    return (
        <Box>
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>question</TableCell>
                        </TableRow>
                    </TableHead>
                    {/* <TableBody> */}
                    {/*ドラッグアンドドロップの有効範囲 */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        {/* ドロップできる範囲 */}
                        <StrictModeDroppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <TableBody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    // style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {/*　ドラッグできる要素　*/}
                                    {questions.map((question, index) => (
                                        <Draggable key={question.id} draggableId={"q-" + question.id} index={index}>
                                            {(provided, snapshot) => (
                                                <TableRow
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}
                                                >
                                                    <TableCell component="th" scope="row" style={{ width: "50%", color: "black" }}>
                                                        {question.id}
                                                    </TableCell>
                                                    <TableCell style={{ width: "50%", color: "black" }}>{question.title}</TableCell>
                                                </TableRow>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </TableBody>
                            )}
                        </StrictModeDroppable>
                    </DragDropContext>
                    {/* </TableBody> */}
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ConfigTest;
