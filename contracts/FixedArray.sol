pragma solidity ^0.4.5;

contract FixedArray {
    uint[4] public storageArray;

    function setAt(uint index, uint value) {
        storageArray[index] = value;
    }
}